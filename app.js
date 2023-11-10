// Supports ES6
// import { create, Whatsapp } from 'venom-bot';
//importacion de modulos, uuid identificadores unicos, vanom-bot framework para interactuar con wssp
//dialogflow modulo para comunicarse con el servicio de procesamiento de dialogflow
const uuid = require("uuid");
const venom = require('venom-bot');
const dialogflow=require("./dialogflow");
const { promiseHooks } = require('v8');
//asociar ID diferente para cada numero de wssp
const sessionIds = new Map();

//inicia una sesion de wssp usando venombot, se llama a la funcion start
venom
  .create({
    session: 'session-name' //nombre de la sesion
  })
  .then((client) => start(client))
  .catch((erro) => {
    console.log(erro);
  });
//funcion llamada cuando se inicia sesion de wssp con exito, define un manejador de eventos para los mensajes entrantes
//cuando recibe un mensaje realiza lo siguiente
function start(client) {
  client.onMessage(async (message) => {
    setSessionAndUser(message.from); //asocia el num tel del remitente con una sesion (setSessionAndUser), se envia mensaje a dialogflow para procesarlo y se obtiene respuesta, recorre cada respuesta y realiza modificaciones opcionales, por ultimo llama a la funcion sendMessageToWhatsapp para enviar respuestas al remitente
    let session = sessionIds.get(message.from);
    let payload=await dialogflow.sendToDialogFlow(message.body, session);
    let responses=payload.fulfillmentMessages;
    for (const response of responses) {
      //prueba de modificacion de respuesta para wssp
      //no optimizado, no lógico
      //response.text.text, xq hay doble text? response contiene la info relacionada a la respuesta del agente
      //el primer text, es el campo dentro de response que contiene la parte de texto de la resp
      //el segundo text, dentro del primer text hay un array, contiene los diffs mensaje de texto
      //que devuelve al usuario, sirve para distintas conversacion acerca de la misma pregunta, o sea "multiples respuestas"
      if (response.text && response.text.text.length > 0) { 
        if (response.text.text[0].startsWith("¡Hola! Soy el Asistente virtual")) { //Default Welcome Intent
          response.text.text[0] = "¡Hola! Soy el Asistente virtual 🤖 de la UTN Reconquista, estoy para responder a las dudas o preguntas frecuentes relacionadas con la facultad. Dime, ¿Qué necesitas saber?";
        }
        if (response.text.text[0].startsWith("¿Quiere Info sobre carreras de grado")){ //Respuesta_carreras
          response.text.text[0] = "¿Quiere Info sobre carreras de grado, posgrado, carreras a distancia o tecnicaturas?🤔, escriba su respuesta";
        }
        if (response.text.text[0].startsWith("Carreras de grado ✍️")){ //Carreras_Grado
          response.text.text[0] = "Contamos con Ingeniería Electromecanica: https://www.frrq.utn.edu.ar/carreras/ie/ y con Lic. en Administración Rural: https://www.frrq.utn.edu.ar/carreras/lar/";
        }
        if (response.text.text[0].startsWith("Carreras de Posgrado 👩‍🎓👨‍🎓:")){ //Carreras_posgrado
          response.text.text[0] = "Contamos con Dirección y gestión de empresas agroindustriales: https://www.frrq.utn.edu.ar/carreras/pdgea/";
        }
        if (response.text.text[0].startsWith("Carreras a distancia 🌐:")){ //Carreras_Distancia
          response.text.text[0] = "Contamos con: \n Tecnicatura Universitaria en Tecnologías de la Información: https://www.frrq.utn.edu.ar/carreras/carreras-a-distancia/tuti-online/ \n Licenciatura en Tecnologías Inclusivas en Educación: https://www.frrq.utn.edu.ar/carreras/carreras-a-distancia/ltie-online/ \n Tecnicatura Universitaria en Ciudades Inteligentes: https://www.frrq.utn.edu.ar/carreras/carreras-a-distancia/tuci-online/ \n Tecnicatura Universitaria en Administración: https://frrq.utn.centrodeelearning.com/detalle/carrera/804/tecnicatura-universitaria-en-administracion \n Licenciatura en Logística: https://www.frrq.utn.edu.ar/carreras/carreras-a-distancia/ll-online/ \n Tecnicatura Universitaria en Higiene y Seguridad en el Trabajo: https://frrq.utn.centrodeelearning.com/detalle/carrera/648/tecnicatura-universitaria-en-higiene-y-seguridad-en-el-trabajo \n Licenciatura en Tecnología Educativa: https://frrq.utn.centrodeelearning.com/detalle/carrera/1235/licenciatura-en-tecnologia-educativa \n Tecnicatura Universitaria en Logística: https://frrq.utn.centrodeelearning.com/detalle/carrera/2407/tecnicatura-universitaria-en-logistica?id=999192906";
        }
        if (response.text.text[0].startsWith("Tecnicaturas 👨‍💻👩‍💻:")){ //Carreras_Tecnicaturas
          response.text.text[0] = "Contamos con: \n Tecnicatura Univ. en Higiene y Seguridad en el trabajo: https://www.frrq.utn.edu.ar/carreras/tuhst/ \n Tecnicatura Univ. en Mecatrónica: https://www.frrq.utn.edu.ar/carreras/tum/ \n Tecnicatura Univ. en Programación: https://www.frrq.utn.edu.ar/carreras/tup/";
        }
        if (response.text.text[0].startsWith("Aquí tienes enlaces para ir al módulo de autogestión 👇:")){ //Respuesta_Autogestion
          response.text.text[0] = "Aquí tienes enlaces para ir al módulo de autogestión 👇:\n Docente: http://www3.frrq.utn.edu.ar/sysacadweb/logindocente.asp \n Alumno: http://www3.frrq.utn.edu.ar/sysacadweb/loginalumno.asp";
        }
        //Respuesta_Legajo no hace falta cambiar su respuesta ya que no es un custom payload, sino que es texto plano
        if (response.text.text[0].startsWith("Estas son nuestras redes sociales 💻👇:")){ //Respuesta_RedesSociales
          response.text.text[0] = "Facebook: https://www.facebook.com/utnreconquista \n Instagram: https://www.instagram.com/utnreconquista/ \n Sitio Web: https://www.frrq.utn.edu.ar/";
        }
        if (response.text.text[0].startsWith("Sigue el enlace para ver donde se ubica la universidad:")){ //Respuesta_Ubicacion
          response.text.text[0] = "Sigue el enlace para ver donde se ubica la universidad: https://maps.app.goo.gl/pvn1PmLPDrNszguv8";
        }
        //////
        
      }
      // fin prueba modificacion de respuestas
       await sendMessageToWhatsapp(client, message, response);
    }
      
     });
}
//toma un mensaje entrante y una respuesta, envia la respuesta al remitente, utiliza promesas y devuelve una promesa que se resuelve cuando el mensaje se envia correctamente o se rechaza si hay un error
function sendMessageToWhatsapp(client, message, response) {
    return new Promise((resolve, reject) => {
        client
        .sendText(message.from, response.text.text[0])
        .then((result) => {
            console.log('Result: ', result); //return object success
            resolve(result);
        })
        .catch((erro) => {
            console.error('Error when sending: ', erro);
            reject(erro);
        });
    });
}
//asocia un num tel de remitente con una sesion generada mediante uuid.v1(), verifica si ya existe una sesion para el remitente y la crea si no existe
async function setSessionAndUser(senderId) {
    try {
        if (!sessionIds.has(senderId)) {
            sessionIds.set(senderId, uuid.v1());
        }
    }  catch (error) {
        throw error;
    }
}
//En resumen, este código se utiliza para establecer una sesión de WhatsApp, recibir mensajes entrantes, procesarlos a través de DialogFlow, modificar algunas respuestas y luego enviar las respuestas modificadas de vuelta al remitente de WhatsApp. También gestiona la asociación de sesiones con remitentes utilizando un mapa.
