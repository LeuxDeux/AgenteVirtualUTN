//modulo de nodejs para interactuar con el servicio de dialogflow de google cloud
const dialogflow = require("dialogflow");  //importa biblioteca de dialogflow
const config = require("./config");  //credenciales de google cloud
//se toman las credenciales del "config" para validar credenciales
const credentials = {
  client_email: config.GOOGLE_CLIENT_EMAIL,
  private_key: config.GOOGLE_PRIVATE_KEY,
};
//instancia para interactuar con dialogflow, el cliente se configura con el proyec de dialogflow y sus creds.
const sessionClient = new dialogflow.SessionsClient({
  projectId: config.GOOGLE_PROJECT_ID,
  credentials,
});

/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} projectId The project to be used
 */
//funcion asincronica con 3 parametros, mensaje del usuario, identificacion de seion y params adicionales
async function sendToDialogFlow(msg, session, params) {
  let textToDialogFlow = msg;  //msn del usuario se almacena en esta var
  try { //trycath para manejar excepciones, errores se capturan y se muestran en consola
    const sessionPath = sessionClient.sessionPath( //ruta de sesion utilizando proyecto e iden de sesion proporcionada con params
      config.GOOGLE_PROJECT_ID,
      session
    );
      //objeto "request" contiene info de consulta que se enviara a dialogflow ruta de sesion, msn usuario, lenguaje de consulta y params adicionales
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: textToDialogFlow,
          languageCode: config.DF_LANGUAGE_CODE,
        },
      },
      queryParams: {
        payload: {
          data: params,
        },
      },
    };
    const responses = await sessionClient.detectIntent(request); //se utiliza cliente de sesion para enviar solicitud a dialogflow y se espera respuesta, esta se almacena en la var "responses"
    const result = responses[0].queryResult; //se extrae info de resp de dialogflow, se almacena en var "result", tanto el intent como en la respuesta del agente
    console.log("INTENT EMPAREJADO: ", result.intent.displayName);
    let defaultResponses = [];
    if (result.action !== "input.unknown") {
      result.fulfillmentMessages.forEach((element) => {
          defaultResponses.push(element);
      });
    }
    if (defaultResponses.length === 0) {
      result.fulfillmentMessages.forEach((element) => {
        if (element.platform === "PLATFORM_UNSPECIFIED") {
          defaultResponses.push(element);
        }
      });
    }
    result.fulfillmentMessages = defaultResponses;
    console.log(JSON.stringify(result,null," "));
    return result; //devuelve obj "result" info procesada de la respuesta de dialogflow
    // console.log("se enviara el resultado: ", result);
  } catch (e) {
    console.log("error");
    console.log(e);
  }
}
//se exporta la func sendToDialogFlow para que pueda ser usada por otros modulos o scrips
//permite que otros componentes de la app interactuen con dialogflow
module.exports = {
  sendToDialogFlow,
};
