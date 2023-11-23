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
/////////////////////////////////////////
const responseMappings = require('./responseMappings');
/* [
  { original: "¡Hola! Soy el Asistente virtual", custom: "¡Hola! Soy el Asistente virtual 🤖 de la UTN Reconquista, estoy para responder a las dudas o preguntas frecuentes relacionadas con la facultad. Dime, ¿Qué necesitas saber?" },
  { original: "¿Quiere Info sobre carreras de grado", custom: "¿Quiere Info sobre carreras de grado, posgrado, carreras a distancia o tecnicaturas?🤔, escriba su respuesta" },
  { original: "Carreras de grado ✍️", custom: "Contamos con Ingeniería Electromecanica: https://www.frrq.utn.edu.ar/carreras/ie/ y con Lic. en Administración Rural: https://www.frrq.utn.edu.ar/carreras/lar/"},
  { original: "Carreras de Posgrado 👩‍🎓👨‍🎓:", custom: "Contamos con Dirección y gestión de empresas agroindustriales: https://www.frrq.utn.edu.ar/carreras/pdgea/"},
  { original: "Carreras a distancia 🌐:", custom: "Contamos con: \n Tecnicatura Universitaria en Tecnologías de la Información: https://www.frrq.utn.edu.ar/carreras/carreras-a-distancia/tuti-online/ \nLicenciatura en Tecnologías Inclusivas en Educación: https://www.frrq.utn.edu.ar/carreras/carreras-a-distancia/ltie-online/ \nTecnicatura Universitaria en Ciudades Inteligentes: https://www.frrq.utn.edu.ar/carreras/carreras-a-distancia/tuci-online/ \nTecnicatura Universitaria en Administración: https://frrq.utn.centrodeelearning.com/detalle/carrera/804/tecnicatura-universitaria-en-administracion \nLicenciatura en Logística: https://www.frrq.utn.edu.ar/carreras/carreras-a-distancia/ll-online/ \nTecnicatura Universitaria en Higiene y Seguridad en el Trabajo: https://frrq.utn.centrodeelearning.com/detalle/carrera/648/tecnicatura-universitaria-en-higiene-y-seguridad-en-el-trabajo \nLicenciatura en Tecnología Educativa: https://frrq.utn.centrodeelearning.com/detalle/carrera/1235/licenciatura-en-tecnologia-educativa \nTecnicatura Universitaria en Logística: https://frrq.utn.centrodeelearning.com/detalle/carrera/2407/tecnicatura-universitaria-en-logistica?id=999192906"},
  { original: "Tecnicaturas 👨‍💻👩‍💻:", custom: "Contamos con: \n Tecnicatura Univ. en Higiene y Seguridad en el trabajo: https://www.frrq.utn.edu.ar/carreras/tuhst/ \nTecnicatura Univ. en Mecatrónica: https://www.frrq.utn.edu.ar/carreras/tum/ \nTecnicatura Univ. en Programación: https://www.frrq.utn.edu.ar/carreras/tup/"},
  { original: "Aquí tienes enlaces para ir al módulo de autogestión 👇:", custom: "Aquí tienes enlaces para ir al módulo de autogestión 👇:\nDocente: http://www3.frrq.utn.edu.ar/sysacadweb/logindocente.asp \nAlumno: http://www3.frrq.utn.edu.ar/sysacadweb/loginalumno.asp"},
  { original: "Estas son nuestras redes sociales 💻👇:", custom: "Facebook: https://www.facebook.com/utnreconquista \n Instagram: https://www.instagram.com/utnreconquista/ \nSitio Web: https://www.frrq.utn.edu.ar/"},
  { original: "Sigue el enlace para ver donde se ubica la universidad:", custom: "Sigue el enlace para ver donde se ubica la universidad: https://maps.app.goo.gl/pvn1PmLPDrNszguv8"},
  { original: "Puedes echarle un vistazo al reglamento de estudio a través de este enlace 👇:", custom: "Puedes echarle un vistazo al reglamento de estudio a través de este enlace 👇:\nhttp://csu.rec.utn.edu.ar/docs/php/salida.php3?tipo=ORD&numero=1549&anio=0&facultad=CSU"},
  { original: "En el siguiente link podes ver las fechas con horarios de cátedras y las fechas de exámenes ✍📅:", custom: "En el siguiente link podes ver las fechas con horarios de cátedras y las fechas de exámenes ✍📅:\nHorarios: https://bit.ly/3OxZQh9"},
  { original: "Una vez inscripto al cursado, desde Alumnado se le darán los accesos a la plataforma virtual, el ingreso se realiza con el número de DNI en USUARIO y CONTRASEÑA. Aquí tienes un enlace directo a Moodle 👇:", custom: "Una vez inscripto al cursado, desde Alumnado se le darán los accesos a la plataforma virtual, el ingreso se realiza con el número de DNI en USUARIO y CONTRASEÑA. Aquí tienes un enlace directo a Moodle 👇:\nMoodle: https://frrq.cvg.utn.edu.ar"},
  { original: "Deberás ingresar al Autogestión Alumnos a través de la página de la Facultad e inscribirte a la asignatura que quieras rendir. Recuerda que puedes inscribirte o cancelar tu inscripción hasta las 13 hs. del día anterior a la fecha de examen.", custom: "Deberás ingresar al Autogestión Alumnos a través de la página de la Facultad e inscribirte a la asignatura que quieras rendir. Recuerda que puedes inscribirte o cancelar tu inscripción hasta las 13 hs. del día anterior a la fecha de examen.\nAutogestión Alumnos: http://www3.frrq.utn.edu.ar/sysacadweb/loginalumno.asp"},
  { original: "Recuerda que si eres un alumno activo en la facultad, debes inscribirte a las materias a través de tu autogestión", custom: "Recuerda que si eres un alumno activo en la facultad, debes inscribirte a las materias a través de tu autogestión (la inscripción no se realiza de manera automática, así que deberás inscribirte al cursado de las asignaturas ANTES del inicio de cada cuatrimestre). Si no sabes tu legajo y/o tu contraseña o si no sabes como operar la interfaz de autogestión, comuníquese con alumnado:  📱  3482 – 751911 (Celular) // 📞  3482 – 420048 Int. 8201 (de 9 a 21 hs) // 📧  auxalumnado@frrq.utn.edu.ar (correo)\nAutogestión Alumnos: http://www3.frrq.utn.edu.ar/sysacadweb/loginalumno.asp"},
  { original: "La universidad dispone de una amplia variedad de cursos online, todos tienen un costo a abonar por cuotas. Para saber sobre el tipo de curso y su costo, más información adicional, ingrese a los siguientes enlaces 👇:", custom: "La universidad dispone de una amplia variedad de cursos online, todos tienen un costo a abonar por cuotas. Para saber sobre el tipo de curso y su costo, más información adicional, ingrese a los siguientes enlaces 👇:\nAprender Online UTN: https://aprenderonline.frrq.utn.edu.ar \nCentro de learning UTN: https://frrq.utn.centrodeelearning.com"}
];*/
/////////////////////////////////////////

//inicia una sesion de wssp usando venombot, se llama a la funcion start
venom
  .create({
    session: 'session-name' //nombre de la sesion
  })
  .then((client) => start(client))
  .catch((erro) => {
    console.log(erro);
  });

////////////////////////////////////////
function findCustomResponse(originalText) {
  const mapping = responseMappings.find(mapping => originalText.startsWith(mapping.original));
  return mapping ? mapping.custom : originalText;
}
///////////////////////////////////////

//funcion llamada cuando se inicia sesion de wssp con exito, define un manejador de eventos para los mensajes entrantes
//cuando recibe un mensaje realiza lo siguiente
function start(client) {
  client.onMessage(async (message) => {
    setSessionAndUser(message.from); //asocia el num tel del remitente con una sesion (setSessionAndUser), se envia mensaje a dialogflow para procesarlo y se obtiene respuesta, recorre cada respuesta y realiza modificaciones opcionales, por ultimo llama a la funcion sendMessageToWhatsapp para enviar respuestas al remitente
    let session = sessionIds.get(message.from);
    let payload=await dialogflow.sendToDialogFlow(message.body, session);
    let responses=payload.fulfillmentMessages;
    for (const response of responses) {
      if (response.text && response.text.text.length > 0) {
        response.text.text[0] = findCustomResponse(response.text.text[0]);
      }
      //prueba de modificacion de respuesta para wssp
      //no optimizado, no lógico
      //response.text.text, xq hay doble text? response contiene la info relacionada a la respuesta del agente
      //el primer text, es el campo dentro de response que contiene la parte de texto de la resp
      //el segundo text, dentro del primer text hay un array, contiene los diffs mensaje de texto
      //que devuelve al usuario, sirve para distintas conversacion acerca de la misma pregunta, o sea "multiples respuestas"
      /*
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
          response.text.text[0] = "Contamos con: \n Tecnicatura Universitaria en Tecnologías de la Información: https://www.frrq.utn.edu.ar/carreras/carreras-a-distancia/tuti-online/ \nLicenciatura en Tecnologías Inclusivas en Educación: https://www.frrq.utn.edu.ar/carreras/carreras-a-distancia/ltie-online/ \nTecnicatura Universitaria en Ciudades Inteligentes: https://www.frrq.utn.edu.ar/carreras/carreras-a-distancia/tuci-online/ \nTecnicatura Universitaria en Administración: https://frrq.utn.centrodeelearning.com/detalle/carrera/804/tecnicatura-universitaria-en-administracion \nLicenciatura en Logística: https://www.frrq.utn.edu.ar/carreras/carreras-a-distancia/ll-online/ \nTecnicatura Universitaria en Higiene y Seguridad en el Trabajo: https://frrq.utn.centrodeelearning.com/detalle/carrera/648/tecnicatura-universitaria-en-higiene-y-seguridad-en-el-trabajo \nLicenciatura en Tecnología Educativa: https://frrq.utn.centrodeelearning.com/detalle/carrera/1235/licenciatura-en-tecnologia-educativa \nTecnicatura Universitaria en Logística: https://frrq.utn.centrodeelearning.com/detalle/carrera/2407/tecnicatura-universitaria-en-logistica?id=999192906";
        }
        if (response.text.text[0].startsWith("Tecnicaturas 👨‍💻👩‍💻:")){ //Carreras_Tecnicaturas
          response.text.text[0] = "Contamos con: \n Tecnicatura Univ. en Higiene y Seguridad en el trabajo: https://www.frrq.utn.edu.ar/carreras/tuhst/ \nTecnicatura Univ. en Mecatrónica: https://www.frrq.utn.edu.ar/carreras/tum/ \nTecnicatura Univ. en Programación: https://www.frrq.utn.edu.ar/carreras/tup/";
        }
        if (response.text.text[0].startsWith("Aquí tienes enlaces para ir al módulo de autogestión 👇:")){ //Respuesta_Autogestion
          response.text.text[0] = "Aquí tienes enlaces para ir al módulo de autogestión 👇:\nDocente: http://www3.frrq.utn.edu.ar/sysacadweb/logindocente.asp \nAlumno: http://www3.frrq.utn.edu.ar/sysacadweb/loginalumno.asp";
        }
        //Respuesta_Legajo no hace falta cambiar su respuesta ya que no es un custom payload, sino que es texto plano
        if (response.text.text[0].startsWith("Estas son nuestras redes sociales 💻👇:")){ //Respuesta_RedesSociales
          response.text.text[0] = "Facebook: https://www.facebook.com/utnreconquista \n Instagram: https://www.instagram.com/utnreconquista/ \nSitio Web: https://www.frrq.utn.edu.ar/";
        }
        if (response.text.text[0].startsWith("Sigue el enlace para ver donde se ubica la universidad:")){ //Respuesta_Ubicacion
          response.text.text[0] = "Sigue el enlace para ver donde se ubica la universidad: https://maps.app.goo.gl/pvn1PmLPDrNszguv8";
        }
        if (response.text.text[0].startsWith("Puedes echarle un vistazo al reglamento de estudio a través de este enlace 👇:")){ //21_DF_ReglamentoEstudio
          response.text.text[0] = "Puedes echarle un vistazo al reglamento de estudio a través de este enlace 👇:\nhttp://csu.rec.utn.edu.ar/docs/php/salida.php3?tipo=ORD&numero=1549&anio=0&facultad=CSU";
        }
        if (response.text.text[0].startsWith("En el siguiente link podes ver las fechas con horarios de cátedras y las fechas de exámenes ✍📅:")){ //7_DF_HorariosFechas
          response.text.text[0] = "En el siguiente link podes ver las fechas con horarios de cátedras y las fechas de exámenes ✍📅:\nHorarios: https://bit.ly/3OxZQh9";
        }
        if (response.text.text[0].startsWith("Una vez inscripto al cursado, desde Alumnado se le darán los accesos a la plataforma virtual, el ingreso se realiza con el número de DNI en USUARIO y CONTRASEÑA. Aquí tienes un enlace directo a Moodle 👇:")){ //8_DF_Moodle
          response.text.text[0] = "Una vez inscripto al cursado, desde Alumnado se le darán los accesos a la plataforma virtual, el ingreso se realiza con el número de DNI en USUARIO y CONTRASEÑA. Aquí tienes un enlace directo a Moodle 👇:\nMoodle: https://frrq.cvg.utn.edu.ar";
        }
        if (response.text.text[0].startsWith("Deberás ingresar al Autogestión Alumnos a través de la página de la Facultad e inscribirte a la asignatura que quieras rendir. Recuerda que puedes inscribirte o cancelar tu inscripción hasta las 13 hs. del día anterior a la fecha de examen.")){ //9_DF_InscripcionRendir
          response.text.text[0] = "Deberás ingresar al Autogestión Alumnos a través de la página de la Facultad e inscribirte a la asignatura que quieras rendir. Recuerda que puedes inscribirte o cancelar tu inscripción hasta las 13 hs. del día anterior a la fecha de examen.\nAutogestión Alumnos: http://www3.frrq.utn.edu.ar/sysacadweb/loginalumno.asp";
        }
        if (response.text.text[0].startsWith("Recuerda que si eres un alumno activo en la facultad, debes inscribirte a las materias a través de tu autogestión")) { //10_DF_InscripcionMaterias
          response.text.text[0] = "Recuerda que si eres un alumno activo en la facultad, debes inscribirte a las materias a través de tu autogestión (la inscripción no se realiza de manera automática, así que deberás inscribirte al cursado de las asignaturas ANTES del inicio de cada cuatrimestre). Si no sabes tu legajo y/o tu contraseña o si no sabes como operar la interfaz de autogestión, comuníquese con alumnado:  📱  3482 – 751911 (Celular) // 📞  3482 – 420048 Int. 8201 (de 9 a 21 hs) // 📧  auxalumnado@frrq.utn.edu.ar (correo)\nAutogestión Alumnos: http://www3.frrq.utn.edu.ar/sysacadweb/loginalumno.asp";
        }
        if (response.text.text[0].startsWith("La universidad dispone de una amplia variedad de cursos online, todos tienen un costo a abonar por cuotas. Para saber sobre el tipo de curso y su costo, más información adicional, ingrese a los siguientes enlaces 👇:")){ //13_DF_CursosOnline
          response.text.text[0] = "La universidad dispone de una amplia variedad de cursos online, todos tienen un costo a abonar por cuotas. Para saber sobre el tipo de curso y su costo, más información adicional, ingrese a los siguientes enlaces 👇:\nAprender Online UTN: https://aprenderonline.frrq.utn.edu.ar \nCentro de learning UTN: https://frrq.utn.centrodeelearning.com";
        }
        //////
        
        
      }*/
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
