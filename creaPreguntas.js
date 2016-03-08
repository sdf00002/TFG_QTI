// JavaScript Document
// Nombre del archivo: creaPreguntas.js

//Autor: Sergio Díaz Fuentes

//Función para cargar el fichero xml
function loadXMLDoc(xmlName) {
  var xmlhttp;
  if (window.XMLHttpRequest) {
    xmlhttp = new XMLHttpRequest();
  } else {
    // code for older browsers
    xmlhttp = new ActiveXObject("Microsoft.XMLDOM");
  }
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      myFunction(xmlhttp);
    }
  };
  xmlhttp.open("GET", xmlName, true);
  xmlhttp.send();
}

function myFunction(xml) {
    var xmlDoc = xml.responseXML;
	if (xmlDoc != null)
	{
		ponDiv();
		// En la variable div_preguntas obtenemos el contenedor div con el id 'preguntas'
		var div_preguntas = document.getElementById('preguntas');

	 // Obtenemos la lista de preguntas
		var preguntas_tag = xmlDoc.getElementsByTagName("questestinterop")[0].getElementsByTagName("item");

		//Mezclamos un array auxiliar que nos servirá para obtener las preguntas de forma aleatoria
		var arrayaux=arrayAlea(preguntas_tag);
		for (var i = 0; i < 4; i++)
		{
	  // Obtenemos el título de la pregunta
	  //var titulo = preguntas_tag[arrayaux[i]].getAttribute("title");
	  var titulo=preguntas_tag[arrayaux[i]].getElementsByTagName("mattext")[0].childNodes[0].nodeValue;

	  //Obtenemos el tipo de la pregunta
	  var tipo=preguntas_tag[arrayaux[i]].getElementsByTagName("qtimetadatafield")[1].getElementsByTagName("fieldentry")[0].childNodes[0].nodeValue;
	  
	  //Obtenemos el identificador de la pregunta
	  id=preguntas_tag[arrayaux[i]].getAttribute("ident");

	  
	  var opciones="";

		if(tipo=="SINGLE CHOICE QUESTION"){
			// Obtenemos las opciones de la pregunta
			var opciones_tag = preguntas_tag[arrayaux[i]].getElementsByTagName("mattext");
			//Obtenemos los puntos de cada opcion
			var puntos=preguntas_tag[arrayaux[i]].getElementsByTagName("setvar");
				opciones+=unica(opciones_tag,id,puntos,i);
		}else
				if(tipo=="NUMERIC QUESTION"){
					//Obtenemos los límites superior e inferior para la pregunta
					var sup=preguntas_tag[arrayaux[i]].getElementsByTagName("varlte")[0].childNodes[0].nodeValue;
					var inf=preguntas_tag[arrayaux[i]].getElementsByTagName("vargte")[0].childNodes[0].nodeValue;
					//Obtenemos el numero máximo de caracteres permitidos
					var maxcar=preguntas_tag[arrayaux[i]].getElementsByTagName("render_fib")[0].getAttribute("maxchars");
					//Obtenemos los puntos en caso de acierto
					var puntos=preguntas_tag[arrayaux[i]].getElementsByTagName("setvar")[0].childNodes[0].nodeValue;
					opciones+=numerica(id,sup,inf,puntos,maxcar,i);
				}
				else
					if(tipo=="MULTIPLE CHOICE QUESTION"){
						// Obtenemos las opciones de la pregunta
						var opciones_tag = preguntas_tag[arrayaux[i]].getElementsByTagName("mattext");
						//Obtenemos los puntos de cada opcion
						var puntos=preguntas_tag[arrayaux[i]].getElementsByTagName("setvar");
						opciones+=multiple(opciones_tag,id,puntos,i);
					}

	  // Modificamos el contenido html del contenedor div
	   div_preguntas.innerHTML += "<p>" + titulo + "</p>"+opciones;
	
		}
	//ponBoton();
	}
}

//http://www.forosdelweb.com/f13/crear-div-desde-javascript-938236/
//Función para añadir una etiqueta div al cuerpo del html
function ponDiv(){
	var midiv = document.createElement("div");
		midiv.setAttribute("id","preguntas");
		document.body.appendChild(midiv); // Lo pones en "body", si quieres ponerlo dentro de algún id en concreto usas document.getElementById('donde lo quiero poner').appendChild(midiv);
}

//Funcion que añade el botón para corregir todas las preguntas
function ponBoton(){
		// En la variable div_preguntas obtenemos el contenedor div con el id 'preguntas'
	var div_preguntas = document.getElementById('preguntas');
	 div_preguntas.innerHTML += "<input type=\"button\" name=\"test\"  value=\"Corregir todas\"  onclick=\"corrige()\"/>";
}

//Funcion para obtener un array aleatorio dependiendo de la longitud del array de entrada
function arrayAlea(array){
	var unArray=[];
	for(var z=0;z<array.length;z++){
		unArray[z]=z;
	}
	fisher_yates(unArray);
	return unArray;
}

//Funcion para obtener un array aleatorio dependiendo del valor del parametro de entrada
function arrayAleaEnt(entero){
	var unArray=[];
	for(var z=0;z<entero;z++){
		unArray[z]=z;
	}
	fisher_yates(unArray);
	return unArray;
}
/*
 * Aleatoriza un array según el algoritmo de Fisher-Yates
 */
function fisher_yates(array){
    var i=array.length;
    while(i--){
        var j=Math.floor( Math.random() * (i+1) );
        var tmp=array[i];
        array[i]=array[j];
        array[j]=tmp;
    }
}

//Funcion crear pregunta respuesta unica
function unica(opciones_tag,ident,pts,ent){
	var vector=arrayAleaEnt((opciones_tag.length-1)/2);
	var opciones="<form name=\"formulario\">";
	for (var j = 0; j < (opciones_tag.length-1)/2; j++){
	opciones += "<input type=\"radio\" name=\""+ident+"\"puntos=\""+pts[vector[j]].childNodes[0].nodeValue+"\"/>"+opciones_tag[vector[j]+1].childNodes[0].nodeValue+"</br>";
	}
		opciones += "<input name=\"valida"+ent+"\" type=\"button\" value=\"Validar\" onclick=\"puntuar("+ident+","+ent+")\"/><input name=\"borra"+ent+"\" type=\"reset\" value=\"Borrar\" /><form>";
	return opciones;
	
}

//Funcion crear pregunta numerica
function numerica(iden,superior,inferior,pts,maxcar,ent){
	var opciones="<form name=\"formulario\">";
	opciones += "Escribe el valor: <input type=\"text\" name=\""+iden+"\" puntos=\""+pts+"\" size=\"3\" maxlength=\""+parseInt(maxcar)+"\"/></br></br>";
		opciones += "<input name=\"valida"+ent+"\" type=\"button\" value=\"Validar\" onclick=\"puntuarNum("+iden+","+ent+","+inferior+","+superior+")\"/><input name=\"borra"+ent+"\" type=\"reset\" value=\"Borrar\" /></form>";
	return opciones;
}

//Funcion crear pregunta respuesta multiple
function multiple(opciones_tag,ident,pts,ent){
	//Vectores que contendran los puntos de las opciones
	var respondidas=[]; 
	var norespondidas=[];
			var j=0;
	for(var z = 0; z < pts.length; z=z+2){
		respondidas[j]=pts[z].childNodes[0].nodeValue;	
		norespondidas[j]=pts[z+1].childNodes[0].nodeValue;
		j++;
	}

	var vector=arrayAleaEnt((opciones_tag.length-1)/2);
	var opciones="<form name=\"formulario\">";
	for (var j = 0; j < (opciones_tag.length-1)/2; j++){
	opciones += "<input type=\"checkbox\" name=\""+ident+"\" respondida=\""+respondidas[vector[j]]+"\" norespondida=\""+norespondidas[vector[j]]+"\"/>"+opciones_tag[vector[j]+1].childNodes[0].nodeValue+"</br>";
	}
		opciones += "<input name=\"valida"+ent+"\" type=\"button\" value=\"Validar\" onclick=\"puntuarMul("+ident+","+ent+")\"/><input name=\"borra"+ent+"\" type=\"reset\" value=\"Borrar\" /><form>";
	return opciones;

}

//Funcion para puntuar una pregunta unica
function puntuar(iden, ent){
	var puntuacion=0;
	var validado=validacion(iden);
	var opt=document.getElementsByName(iden[0].name);
		if (validado!=false){		
			for(var i=0; i<opt.length;i++){
				if(opt[i].checked){
					puntuacion+=parseFloat(opt[i].getAttribute("puntos")); 					
				}
				opt[i].disabled = true;
			}
		}
		else{
			for(var i=0; i<opt.length;i++){
					opt[i].disabled = true;
			}
		}
		document.getElementsByName("valida"+ent)[0].disabled = true;
		document.getElementsByName("borra"+ent)[0].disabled = true;
		alert("Tu puntuación es de: "+puntuacion);
		return true;
	
}

//Funcion para puntuar una pregunta múltiple
function puntuarMul(iden, ent){
	var puntuacion=0;
	var opt=document.getElementsByName(iden[0].name);

			for(var i=0; i<opt.length;i++){
				if(opt[i].checked){
					puntuacion+=parseFloat(opt[i].getAttribute("respondida")); 					
				}
				else
					puntuacion+=parseFloat(opt[i].getAttribute("norespondida")); 
				opt[i].disabled = true;
			}
		
		document.getElementsByName("valida"+ent)[0].disabled = true;
		document.getElementsByName("borra"+ent)[0].disabled = true;
		alert("Tu puntuación es de: "+puntuacion);
		return true;
	
}

//Funcion para validar un formulario
function validacion(iden){
 var i;
 var ok=0;
var opt=document.getElementsByName(iden[0].name);
//var opt=document.getElementsByName(iden);
 for(i=0; i<opt.length;i++){
	if(opt[i].checked)
  {
   ok=1
  // alert(opt[i].attributes[2].value);
  //alert(opt[i].getAttribute("correcta"));
  }    
 }

 if(ok==1)
  return true
	else{
		//alert("Debes seleccionar una opcion");
	return false	}
}

function puntuarNum(iden, ent, inf, sup){
	var puntuacion=0;
		var valor=parseFloat(iden.value);
		var puntos=document.getElementsByName(iden.name)[0].getAttribute("puntos");
		if(valor<=sup && valor>=inf)
			puntuacion+=parseFloat(puntos);
		//Deshabilitamos los botones
		document.getElementsByName("valida"+ent)[0].disabled = true;
		document.getElementsByName("borra"+ent)[0].disabled = true;
		document.getElementsByName(iden.name)[0].disabled = true;
		alert("Tu puntuación es de: "+puntuacion);
		return true;
}
