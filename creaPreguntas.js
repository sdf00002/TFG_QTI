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
	  var titulo = preguntas_tag[arrayaux[i]].getAttribute("title");
	  var descripcion=preguntas_tag[arrayaux[i]].getElementsByTagName("mattext")[0].childNodes[0].nodeValue;

	  //Obtenemos el tipo de la pregunta
	  var tipo=preguntas_tag[arrayaux[i]].getElementsByTagName("qtimetadatafield")[1].getElementsByTagName("fieldentry")[0].childNodes[0].nodeValue;
	  
	  //Obtenemos el identificador de la pregunta
	  var id=preguntas_tag[arrayaux[i]].getAttribute("ident");
	
	  var flag=0;

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
					else
						//https://social.msdn.microsoft.com/Forums/es-ES/119aa457-11f6-408b-9c70-d368deabd597/javascript-saber-si-una-letra-esta-en-una-cadena-de-caracteres?forum=netfxwebes
					if(tipo=="CLOZE QUESTION"){
						var opciones_tag = preguntas_tag[arrayaux[i]].getElementsByTagName("mattext");
						var nhuecos=preguntas_tag[arrayaux[i]].getElementsByTagName("render_fib");
						var soloHuecos=preguntas_tag[arrayaux[i]].getElementsByTagName("render_choice"); //Etiqueta que aparece en preguntas con desplegables
						var puntos=preguntas_tag[arrayaux[i]].getElementsByTagName("setvar");
						var oposibles=preguntas_tag[arrayaux[i]].getElementsByTagName("varequal");
						
						descripcion="";
						//Solo si son huecos de rellenar texto se crea la pregunta
						if(soloHuecos.length==0){
							descripcion="<form name=\"formulario\">"+preguntas_tag[arrayaux[i]].getElementsByTagName("mattext")[0].childNodes[0].nodeValue;
							for (var w = 1; w < opciones_tag.length-nhuecos.length; w++)
							{	
								//Añadimos los huecos
								descripcion+="<input type=\"text\" name=\""+id+"\" tipo=\""+nhuecos[w-1].getAttribute("fibtype")+"\" sensibilidad=\""+preguntas_tag[arrayaux[i]].getElementsByTagName("fieldentry")[5].childNodes[0].nodeValue+"\" puntos=\"\" sol=\"\" size=\"3\" maxlength=\""+parseInt(nhuecos[w-1].getAttribute("columns"))+"\"/>";
								//Vamos añadiendo el resto de enunciado
								descripcion+=opciones_tag[w].childNodes[0].nodeValue;
								
							}						
							descripcion+="<input name=\"valida"+i+"\" type=\"button\" value=\"Validar\" onclick=\"puntuaHuecos("+id+","+i+")\"/><input name=\"borra"+i+"\" type=\"reset\" value=\"Borrar\" /></form>";
													
						}
							  // Modificamos el contenido html del contenedor div
								div_preguntas.innerHTML += "<p>" + titulo + "</p><p>" + descripcion + "</p>"+opciones;
								
								for (var q = 0; q < nhuecos.length; q++){
									for (var k = 0; k < oposibles.length; k++){
										if (oposibles[k].getAttribute("respident").indexOf(q) != -1){
											//alert(oposibles[k].childNodes[0].nodeValue);
											var attAnterior = document.getElementsByName(id)[q].getAttribute("sol");
											var puntAnterior = document.getElementsByName(id)[q].getAttribute("puntos");
											document.getElementsByName(id)[q].setAttribute("sol",attAnterior+oposibles[k].childNodes[0].nodeValue+",");
											document.getElementsByName(id)[q].setAttribute("puntos",puntAnterior+preguntas_tag[arrayaux[i]].getElementsByTagName("setvar")[k].childNodes[0].nodeValue+",");						
										}
									}
								}
								console.log(document);
								flag=1; //Este flag nos permite que no se repita la pregunta de nuevo en el div_preguntas
					}

	  // Modificamos el contenido html del contenedor div
	  if(flag == 0){
	   div_preguntas.innerHTML += "<p>" + titulo + "</p><p>" + descripcion + "</p>"+opciones;
	  }
	  
	  //Ponemos de nuevo el flag a 0
		if(flag == 1){
			flag=0;
		}
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
		opciones += "<input name=\"valida"+ent+"\" type=\"button\" value=\"Validar\" onclick=\"puntuar("+ident+","+ent+")\"/><input name=\"borra"+ent+"\" type=\"reset\" value=\"Borrar\" /></form>";
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
		opciones += "<input name=\"valida"+ent+"\" type=\"button\" value=\"Validar\" onclick=\"puntuarMul("+ident+","+ent+")\"/><input name=\"borra"+ent+"\" type=\"reset\" value=\"Borrar\" /></form>";
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
//http://www.w3schools.com/jsref/jsref_split.asp
//https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/String/substr
//http://www.lawebdelprogramador.com/foros/JavaScript/1429850-solucionado-Obtener-el-mayor-y-menor-valor-de-un-array-arreglo.html
//https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/Array/indexOf
//Funcion para puntuar una pregunta de rellenar huecos
function puntuaHuecos(iden, ent){
	var puntuacion = 0;
	//Obtenemos las soluciones de los huecos
	var opcs = document.getElementsByName(iden[0].name);
	
	//Obtenemos la sensibilidad de la pregunta
	var sensibilidad = document.getElementsByName(iden[0].name)[0].getAttribute("sensibilidad");

	for(var i = 0; i < opcs.length; i++){
		//Obtenemos los puntos de las opciones
		var puntos = document.getElementsByName(iden[i].name)[i].getAttribute("puntos").split(",");
		
		//Obtenemos los opciones de la pregunta
		var opciones = document.getElementsByName(iden[i].name)[i].getAttribute("sol").split(",");

		
		//Comprobamos si el tipo es String o no
	if(document.getElementsByName(iden[i].name)[i].getAttribute("tipo")=="String"){
				
					//Si no es sensible a mayúsculas
					if(sensibilidad == "ci"){
						for(var k = 0; k < opciones.length - 1; k++){
							if(iden[i].value.toLowerCase() == opciones[k].toLowerCase()){
							puntuacion+=parseFloat(puntos[k]);
							break;
							}	
						}
					}else
					//Si es sensible a mayúsculas
					if(sensibilidad == "cs"){
						for(var k = 0; k < opciones.length - 1; k++){
							if(iden[i].value == opciones[k]){
							puntuacion+=parseFloat(puntos[k]);
							break;
							}	
						}
					}
					//Si tiene distancia de Levenshtein
					else {
						var dist = parseInt(sensibilidad.substr(1,1)); //Valor de distancia de Levenshtein para esta pregunta
						var levens = [];
						for(var k = 0; k < opciones.length - 1; k++){
						levens [k] = getEditDistance(iden[i].value, opciones[k]); //Distancia Levenshtein entre las dos palabras
						}
						var min = Math.min.apply(null, levens); //Mínimo del vector
						var indice = levens.indexOf(min,0); //Índice del valor mínimo encontrado
							if(min == dist){
								puntuacion+=parseFloat(puntos[indice]);
							}
					}
										
	}
			//Si no es de tipo String
			if(document.getElementsByName(iden[i].name)[i].getAttribute("tipo") != "String"){
				for(var k = 0; k < opciones.length - 1; k++){
					if(iden[i].value == opciones[k]){
							puntuacion+=parseFloat(puntos[k]);
							break;
					}
				}
			}
			//Deshabilitamos el cuadro de texto
		document.getElementsByName(iden[i].name)[i].disabled = true;	
	}
				//Deshabilitamos los botones
		document.getElementsByName("valida"+ent)[0].disabled = true;
		document.getElementsByName("borra"+ent)[0].disabled = true;
		alert("Tu puntuación es de: "+puntuacion);

return true;	
}

//http://www.etnassoft.com/2011/03/03/eliminar-tildes-con-javascript/
//Función utilizada para eliminar caracteres raros de una cadena de texto
var normalize = (function() {
  var from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç", 
      to   = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc",
      mapping = {};
 
  for(var i = 0, j = from.length; i < j; i++ )
      mapping[ from.charAt( i ) ] = to.charAt( i );
 
  return function( str ) {
      var ret = [];
      for( var i = 0, j = str.length; i < j; i++ ) {
          var c = str.charAt( i );
          if( mapping.hasOwnProperty( str.charAt( i ) ) )
              ret.push( mapping[ c ] );
          else
              ret.push( c );
      }      
      return ret.join( '' );
  }
 
})();

//https://gist.github.com/andrei-m/982927
function getEditDistance (a, b){
  if(a.length == 0) return b.length; 
  if(b.length == 0) return a.length; 

  var matrix = [];

  // increment along the first column of each row
  var i;
  for(i = 0; i <= b.length; i++){
    matrix[i] = [i];
  }

  // increment each column in the first row
  var j;
  for(j = 0; j <= a.length; j++){
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for(i = 1; i <= b.length; i++){
    for(j = 1; j <= a.length; j++){
      if(b.charAt(i-1) == a.charAt(j-1)){
        matrix[i][j] = matrix[i-1][j-1];
      } else {
        matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                Math.min(matrix[i][j-1] + 1, // insertion
                                         matrix[i-1][j] + 1)); // deletion
      }
    }
  }

  return matrix[b.length][a.length];
};
