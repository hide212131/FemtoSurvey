/**
 * Use a custom resolver to update a single SurveyForm and multiple SurveyInputs tied to it. 
 * Reference: 
 * https://dev.to/aws-builders/use-lambda-resolvers-in-your-graphql-api-with-aws-amplify-5e13
 */
import * as AWS from "aws-sdk";
import { Callback, Context, Handler } from "aws-lambda";

const docClient = new AWS.DynamoDB.DocumentClient();

const FORMTABLE = process.env.FORMTABLE;
const INPUTTABLE = process.env.INPUTTABLE;

interface IEvent {
  typeName: string;
  fieldName: string;
  arguments: {
    formID: string;
  };
}

const resolvers = {
  Mutation: {
    deleteFormAndInputs: (event: IEvent) => {
      return deleteFormAndInputs(event);
    },
  },
};

export const handler: Handler<IEvent, string[]> = async (
  event: IEvent,
  context: Context,
  callback: Callback<string[]>
) => {
  //exports.handler = async function (event, context) {
  console.log(event);
  console.log(context);

  const typeHandler = resolvers[event.typeName];
  if (typeHandler) {
    const resolver = typeHandler[event.fieldName];
    if (resolver) {
      return await resolver(event);
    }
  }
  throw new Error("Resolver not found.");
};

async function deleteFormAndInputs(event: IEvent) {
  const removeInputsProm = removeInputsOfForm(event.arguments.formID);
  const removeFormProm = removeForm(event.arguments.formID);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, deletedForm] = await Promise.all([
    removeInputsProm,
    removeFormProm,
  ]);
  return { id: deletedForm.id };
}

async function removeForm(formID: string) {
  const deletedForm = await deleteForm(formID);
  console.log("Deleted Form is: ", deletedForm);
  console.log("Deleted Form with id: ", deletedForm.id);
  return deletedForm;
}

async function removeInputsOfForm(formID: string) {
  const inputs = await listInputsForForm(formID);
  await deleteInputs(inputs);
}

async function listInputsForForm(
  formID: string
): Promise<AWS.DynamoDB.DocumentClient.ItemList> {
  var params: AWS.DynamoDB.DocumentClient.QueryInput = {
    TableName: INPUTTABLE,
    IndexName: "byForm",
    KeyConditionExpression: "formID = :formID",
    ExpressionAttributeValues: { ":formID": formID },
  };
  try {
    const data = await docClient.query(params).promise();
    return data.Items;
  } catch (err) {
    return err;
  }
}

async function deleteInputs(inputs: AWS.DynamoDB.DocumentClient.ItemList) {
  // format data for docClient
  const seedData: AWS.DynamoDB.DocumentClient.WriteRequest[] = inputs.map(
    (item) => {
      return { DeleteRequest: { Key: { id: item.id } } };
    }
  );

  /* We can only batch-write 25 items at a time,
    so we'll store both the quotient, as well as what's left.
    */

  let quotient = Math.floor(seedData.length / 25);
  const remainder = seedData.length % 25;
  /* Delete in increments of 25 */

  let batchMultiplier = 1;
  while (quotient > 0) {
    for (let i = 0; i < seedData.length - 1; i += 25) {
      await docClient
        .batchWrite(
          {
            RequestItems: {
              [INPUTTABLE]: seedData.slice(i, 25 * batchMultiplier),
            },
          },
          (err, data) => {
            if (err) {
              console.log(err);
              console.log("something went wrong...");
            }
          }
        )
        .promise();
      ++batchMultiplier;
      --quotient;
    }
  }

  /* Upload the remaining items (less than 25) */
  if (remainder > 0) {
    await docClient
      .batchWrite(
        {
          RequestItems: {
            [INPUTTABLE]: seedData.slice(seedData.length - remainder),
          },
        },
        (err, data) => {
          if (err) {
            console.log(err);
            console.log("something went wrong...");
          }
        }
      )
      .promise();
  }
}

async function deleteForm(id: string) {
  var params = {
    TableName: FORMTABLE,
    Key: { id },
    ReturnValues: "ALL_OLD",
  };
  try {
    const data = await docClient.delete(params).promise();
    const response = data.Attributes;
    return response;
  } catch (err) {
    return err;
  }
}
