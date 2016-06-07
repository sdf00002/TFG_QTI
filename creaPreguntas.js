/* creaPreguntas.js JavaScript library by Sergio Díaz (sdf00002@red.ujaen.es)
Librería desarrollada por Sergio Díaz Fuentes. Se permite cualquier explotación de la obra, incluyendo una finalidad comercial, así como la creación de obras derivadas, la distribución de las cuales también está permitida sin ninguna restricción.
En cualquier explotación de la obra autorizada por la licencia hará falta reconocer la autoría.
*/

/*******************************************************************************
**
** Function: loadXMLDoc()
** Inputs:  The name of the xml file in which the questions are and the name of questions of the test.
** Return:  The number of requested test questions presented randomly. 
**
** Description:
** Requests the xml file and presents the questions.
**
*******************************************************************************/
function loadXMLDoc(xmlName,numPreguntas) {
  var xmlhttp;
  if (window.XMLHttpRequest) {
    xmlhttp = new XMLHttpRequest();
  } else {
    // code for older browsers
    xmlhttp = new ActiveXObject("Microsoft.XMLDOM");
  }
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      myFunction(xmlhttp,numPreguntas);
    }
  };
  xmlhttp.open("GET", xmlName, true);
  xmlhttp.send();
}

/*******************************************************************************
**
** Function: myFunction()
** Inputs:  The html request of the xml file in which the questions are and the name of questions of the test.
** Return:  None.
**
** Description:
** It parses the xml file and it presented randomly the number of requested test questions. 
**
*******************************************************************************/
function myFunction(xml,numPreg) {
    var xmlDoc = xml.responseXML;
	if (xmlDoc != null)
	{
		ponDiv();
		// En la variable div_preguntas obtenemos el contenedor div con el id 'preguntas'
		var div_preguntas = document.getElementById('preguntas');

		// Obtenemos la lista de preguntas
		var preguntas_tag = xmlDoc.getElementsByTagName("questestinterop")[0].getElementsByTagName("item");
		
		// Comprobamos que el número de preguntas sea igual o inferior al número de preguntas disponibles
		if (numPreg > preguntas_tag.length){
			numPreg = preguntas_tag.length;
		}
		
		//Mezclamos un array auxiliar que nos servirá para obtener las preguntas de forma aleatoria
		var arrayaux=arrayAlea(preguntas_tag);
		var i = 0;
		var contador = 0;
		var correctas = new Array();
		var patt = "";
		while (i < numPreg)
		{
		  // Obtenemos el título de la pregunta
		  var titulo = preguntas_tag[arrayaux[i]].getAttribute("title");
		  var descripcion=preguntas_tag[arrayaux[i]].getElementsByTagName("mattext")[0].childNodes[0].nodeValue;

		  //Obtenemos el tipo de la pregunta
		  var tipo=preguntas_tag[arrayaux[i]].getElementsByTagName("qtimetadatafield")[1].getElementsByTagName("fieldentry")[0].childNodes[0].nodeValue;
		  
		  //Obtenemos el identificador de la pregunta
		  var id=preguntas_tag[arrayaux[i]].getAttribute("ident");
		  
		  //Inicializamos un par de flags auxiliares a cero
		  var flag=0;
		  var flagE = 0;
		  
		  //Inicializamos las opciones de la pregunta a un string vacío	
		  var opciones="";

			if(tipo=="SINGLE CHOICE QUESTION"){
				// Obtenemos las opciones de la pregunta
				var opciones_tag = preguntas_tag[arrayaux[i]].getElementsByTagName("mattext");
				//Obtenemos los puntos de cada opcion
				var puntos=preguntas_tag[arrayaux[i]].getElementsByTagName("setvar");
					opciones+=unica(opciones_tag,id,puntos,contador,numPreg);
					patt = obtieneCorrecta (opciones_tag,puntos);
					total+=sumaPuntos(puntos, tipo);
					flagE = 1;				
			} else
					if(tipo=="NUMERIC QUESTION"){
						//Obtenemos los límites superior e inferior para la pregunta
						var sup=preguntas_tag[arrayaux[i]].getElementsByTagName("varlte")[0].childNodes[0].nodeValue;
						var inf=preguntas_tag[arrayaux[i]].getElementsByTagName("vargte")[0].childNodes[0].nodeValue;
						//Obtenemos el numero máximo de caracteres permitidos
						var maxcar=preguntas_tag[arrayaux[i]].getElementsByTagName("render_fib")[0].getAttribute("maxchars");
						//Obtenemos los puntos en caso de acierto
						var puntos=preguntas_tag[arrayaux[i]].getElementsByTagName("setvar")[0].childNodes[0].nodeValue;
						opciones+=numerica(id,sup,inf,puntos,maxcar,contador,numPreg);
						total+=parseFloat(puntos);
						flagE = 1;
						patt = inf+"[:]"+sup;
						//miRTE.setInteractionsAddAll(id,"numeric",1,descripcion,patt);
					}	else
							if(tipo=="MULTIPLE CHOICE QUESTION"){
								// Obtenemos las opciones de la pregunta
								var opciones_tag = preguntas_tag[arrayaux[i]].getElementsByTagName("mattext");
								//Obtenemos los puntos de cada opcion
								var puntos=preguntas_tag[arrayaux[i]].getElementsByTagName("setvar");
								opciones+=multiple(opciones_tag,id,puntos,contador,numPreg);
								patt = obtieneCorrectaMul (opciones_tag,puntos);
								total+=sumaPuntos(puntos, tipo);
								flagE = 1;
							} 	else
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
										total+=sumaPuntos(puntos,tipo);
										descripcion="<form name=\"formulario\">"+preguntas_tag[arrayaux[i]].getElementsByTagName("mattext")[0].childNodes[0].nodeValue;
										for (var w = 1; w < opciones_tag.length-nhuecos.length; w++)
										{	
											//Añadimos los huecos
											descripcion+="<input type=\"text\" name=\""+id+"\" tipo=\""+nhuecos[w-1].getAttribute("fibtype")+"\" sensibilidad=\""+preguntas_tag[arrayaux[i]].getElementsByTagName("fieldentry")[5].childNodes[0].nodeValue+"\" puntos=\"\" sol=\"\" size=\"3\" maxlength=\""+parseInt(nhuecos[w-1].getAttribute("columns"))+"\"/>";
											//Vamos añadiendo el resto de enunciado
											descripcion+=opciones_tag[w].childNodes[0].nodeValue;
											
										}						
										
										if (contador + 1 != numPreg)
											descripcion+="<input name=\"valida"+contador+"\" type=\"button\" value=\"Validar\" onclick=\"puntuaHuecos("+id+","+contador+","+numPreg+")\" class=\"boton\"/><input name=\"borra"+contador+"\" type=\"reset\" value=\"Borrar\" class=\"boton\"/><input name=\"esconde"+contador+"\" type=\"button\" value=\"Posponer\" class=\"boton\" onclick=\"muestra("+contador+","+numPreg+")\"/></form>";
										else
											descripcion+="<input name=\"valida"+contador+"\" type=\"button\" value=\"Validar\" onclick=\"puntuaHuecos("+id+","+contador+","+numPreg+")\" class=\"boton\"/><input name=\"borra"+contador+"\" type=\"reset\" value=\"Borrar\" class=\"boton\"/></form>";
																
									
										  // Modificamos el contenido html del contenedor div
											if (contador==0)
												div_preguntas.innerHTML += "<div id=\"div"+contador+"\" style=\"display:block;\"><form name=\"formulario"+contador+"\"><h3>" + titulo + "</h3>" + descripcion +"</form></div>";
											else
												div_preguntas.innerHTML += "<div id=\"div"+contador+"\" style=\"display:none;\"><form name=\"formulario"+contador+"\"><h3>" + titulo + "</h3>" + descripcion +"</form></div>";
											
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
											flag=1; //Este flag nos permite que no se repita la pregunta de nuevo en el div_preguntas
											flagE = 1;
									}
								}

		  // Modificamos el contenido html del contenedor div
			if(flag == 0 && flagE == 1){	
				if (contador == 0){
					div_preguntas.innerHTML += "<div id=\"div"+contador+"\" style=\"display:block;\"><form name=\"formulario"+contador+"\"><h3>" + titulo + "</h3>" + descripcion + opciones+"</form></div>";
					switch (tipo){
						case "SINGLE CHOICE QUESTION":
						miRTE.setInteractionsAddAll(id,"choice",1,titulo,patt);
						break;
						case "MULTIPLE CHOICE QUESTION":
						miRTE.setInteractionsAddAll(id,"choice",1,titulo,patt);
						break;
						case "NUMERIC QUESTION":
						miRTE.setInteractionsAddAll(id,"numeric",1,titulo,patt);
						break;
						default:
							console.log("No es un tipo válido de pregunta");
					}
				} else
					div_preguntas.innerHTML += "<div id=\"div"+contador+"\" style=\"display:none;\"><form name=\"formulario"+contador+"\"><h3>" + titulo + "</h3>" + descripcion + opciones+"</form></div>";
			}
				
			if(flagE == 1){
				i++;
				contador++;
			} else{
				i++;
			}
			
			 if (i >= preguntas_tag.length)
			 break;
			
			}
	//ponBoton();
	actualiza(puntuacion,total);
	}
}

//http://www.forosdelweb.com/f13/crear-div-desde-javascript-938236/
/*******************************************************************************
**
** Function: ponDiv()
** Inputs:  None.
** Return:  None. 
**
** Description:
** It adds a div tag to the html page.
**
*******************************************************************************/
function ponDiv(){
	var midiv = document.createElement("div");
		midiv.setAttribute("id","preguntas");
		midiv.setAttribute("class","desplazado");
		//document.body.appendChild(midiv); // Lo pones en "body", si quieres ponerlo dentro de algún id en concreto usas document.getElementById('donde lo quiero poner').appendChild(midiv);
		document.getElementById('tabla').appendChild(midiv);
}

/*******************************************************************************
**
** Function: ponBoton()
** Inputs:  None.
** Return:  None. 
**
** Description:
** It adds a button to the html page to correct questions.
**
*******************************************************************************/
function ponBoton(){
		// En la variable div_preguntas obtenemos el contenedor div con el id 'preguntas'
	var div_preguntas = document.getElementById('preguntas');
	 div_preguntas.innerHTML += "<input type=\"button\" name=\"test\"  value=\"Corregir todas\"  onclick=\"corrige()\" class=\"corrige\"/>";
}

/*******************************************************************************
**
** Function: arrayAlea()
** Inputs:  An array of questions.
** Return:  An array with unordered values depending of the length of de questions array. 
**
** Description:
** It mixes a vector of sorted values.
**
*******************************************************************************/
function arrayAlea(array){
	var unArray=[];
	for(var z=0;z<array.length;z++){
		unArray[z]=z;
	}
	fisher_yates(unArray);
	return unArray;
}

/*******************************************************************************
**
** Function: arrayAleaEnt()
** Inputs:  An integer.
** Return:  An array with unordered values depending of the integer. 
**
** Description:
** It mixes a vector of sorted values.
**
*******************************************************************************/
function arrayAleaEnt(entero){
	var unArray=[];
	for(var z=0;z<entero;z++){
		unArray[z]=z;
	}
	fisher_yates(unArray);
	return unArray;
}

/*******************************************************************************
**
** Function: fisher_yates()
** Inputs:  An array of sorted values.
** Return:  The function returns the untidy vector.
**
** Description:
** It mixes a vector of sorted values according to Fisher-Yates algorithm.
**
*******************************************************************************/
function fisher_yates(array){
    var i=array.length;
    while(i--){
        var j=Math.floor( Math.random() * (i+1) );
        var tmp=array[i];
        array[i]=array[j];
        array[j]=tmp;
    }
}

/*******************************************************************************
**
** Function: sumaPuntos()
** Inputs:  An array with the points of a question.
** Return:  The maximum points for this question.
**
** Description:
** It calculates the maximum number of points for this question..
**
*******************************************************************************/
function sumaPuntos(pts,tipo){
	var suma= 0;
	if (tipo.localeCompare("SINGLE CHOICE QUESTION") == 0){
		var arr = [];
		for(var z=0;z<pts.length;z++){
			arr[z] = parseFloat(pts[z].childNodes[0].nodeValue);
		}	
			suma+= Math.max(...arr);	
	} else {
		for(var z=0;z<pts.length;z++){
			if (parseFloat(pts[z].childNodes[0].nodeValue) > 0)
			suma+=parseFloat(pts[z].childNodes[0].nodeValue);
		}
	}
	return suma;
}

function obtieneCorrecta(opciones_tag, pts){
	var corr = "";
	for(var z=0;z<pts.length;z++){
		if (parseFloat(pts[z].childNodes[0].nodeValue) > 0){
			if(z==0)
				corr = opciones_tag[z+1].childNodes[0].nodeValue;
			else
				corr.concat("[,]",opciones_tag[z+1].childNodes[0].nodeValue);
		}
	}
	return corr;
}

function obtieneCorrectaMul(opciones_tag, pts){
	var corr = new Array();
	var j = 0;
	for(var z=0;z<pts.length;z=z+2){
		if (parseFloat(pts[z].childNodes[0].nodeValue) > 0){
		corr[j]=opciones_tag[z/2+1].childNodes[0].nodeValue;
		j++;
		}
	}
	return corr;
}

/*******************************************************************************
**
** Function: unica()
** Inputs:  An array of options, an identifier, an array wiht the options points and an integer.
** Return:  The options of a question in a html format.
**
** Description:
** It gets the options of a question to create a multiple choice question and only answer.
**
*******************************************************************************/
function unica(opciones_tag,ident,pts,ent,nPreg){
	var vector=arrayAleaEnt(pts.length);
	ids[ent] = ident;
	var opciones="<form name=\"formulario\">";
	for (var j = 0; j < pts.length; j++){
	opciones += "<p class=\opciones\><input type=\"radio\" name=\""+ident+"\" value=\""+opciones_tag[vector[j]+1].childNodes[0].nodeValue+"\"puntos=\""+pts[vector[j]].childNodes[0].nodeValue+"\"/>"+opciones_tag[vector[j]+1].childNodes[0].nodeValue+"</p>";
	}
		if (ent + 1 != nPreg)
		opciones += "<input name=\"valida"+ent+"\" type=\"button\" value=\"Validar\" onclick=\"puntuar("+ident+","+ent+","+nPreg+")\" class=\"boton\"/><input name=\"borra"+ent+"\" type=\"reset\" value=\"Borrar\" class=\"boton\"/><input name=\"posponer"+ent+"\" type=\"button\" value=\"Posponer\" class=\"boton\"/ onclick=\"muestra("+ent+","+nPreg+")\">";
		else
		opciones += "<input name=\"valida"+ent+"\" type=\"button\" value=\"Validar\" onclick=\"puntuar("+ident+","+ent+","+nPreg+")\" class=\"boton\"/><input name=\"borra"+ent+"\" type=\"reset\" value=\"Borrar\" class=\"boton\"/>";
	
	return opciones;
	
}

/*******************************************************************************
**
** Function: numerica()
** Inputs:  An identifier, two floats, an array with the options points and two integers.
** Return:  The options of a question in a html format.
**
** Description:
** It gets the options of a question to create a numeric question.
**
*******************************************************************************/
function numerica(iden,superior,inferior,pts,maxcar,ent,nPreg){
	var opciones="<form name=\"formulario\">";
	opciones += "<p class=\"opciones\">Escribe el valor: <input type=\"text\" name=\""+iden+"\" puntos=\""+pts+"\" size=\"3\" maxlength=\""+parseInt(maxcar)+"\"/></p></br>";
		if (ent + 1 != nPreg)
			opciones += "<input name=\"valida"+ent+"\" type=\"button\" value=\"Validar\" onclick=\"puntuarNum("+iden+","+ent+","+inferior+","+superior+","+nPreg+")\" class=\"boton\"/><input name=\"borra"+ent+"\" type=\"reset\" value=\"Borrar\" class=\"boton\"/><input name=\"posponer"+ent+"\" type=\"button\" value=\"Posponer\" class=\"boton\"/ onclick=\"muestra("+ent+","+nPreg+")\">";
		else
			opciones += "<input name=\"valida"+ent+"\" type=\"button\" value=\"Validar\" onclick=\"puntuarNum("+iden+","+ent+","+inferior+","+superior+","+nPreg+")\" class=\"boton\"/><input name=\"borra"+ent+"\" type=\"reset\" value=\"Borrar\" class=\"boton\"/>";
	return opciones;
}

/*******************************************************************************
**
** Function: multiple()
** Inputs:  An array of options, an identifier, an array wiht the options points and an integer.
** Return:  The options of a question in a html format.
**
** Description:
** It gets the options of a question to create a multiple choice question and multiple answer.
**
*******************************************************************************/
function multiple(opciones_tag,ident,pts,ent,nPreg){
	//Vectores que contendran los puntos de las opciones
	var respondidas=[]; 
	var norespondidas=[];
	ids[ent] = ident;
			var j=0;
	for(var z = 0; z < pts.length; z=z+2){
		respondidas[j]=pts[z].childNodes[0].nodeValue;	
		norespondidas[j]=pts[z+1].childNodes[0].nodeValue;
		j++;
	}

	var vector=arrayAleaEnt(pts.length/2);
	var opciones="<form name=\"formulario\">";
	for (var j = 0; j < pts.length/2; j++){
	opciones += "<p class=\"opciones\"><input type=\"checkbox\" name=\""+ident+"\" respondida=\""+respondidas[vector[j]]+"\" norespondida=\""+norespondidas[vector[j]]+"\"/>"+opciones_tag[vector[j]+1].childNodes[0].nodeValue+"</p>";
	}
		if (ent + 1 != nPreg)
			opciones += "<input name=\"valida"+ent+"\" type=\"button\" value=\"Validar\" onclick=\"puntuarMul("+ident+","+ent+","+nPreg+")\" class=\"boton\"/><input name=\"borra"+ent+"\" type=\"reset\" value=\"Borrar\" class=\"boton\"/><input name=\"posponer"+ent+"\" type=\"button\" value=\"Posponer\" class=\"boton\" onclick=\"muestra("+ent+","+nPreg+")\"/>";
		else
			opciones += "<input name=\"valida"+ent+"\" type=\"button\" value=\"Validar\" onclick=\"puntuarMul("+ident+","+ent+","+nPreg+")\" class=\"boton\"/><input name=\"borra"+ent+"\" type=\"reset\" value=\"Borrar\" class=\"boton\"/>";
	return opciones;

}

/*******************************************************************************
**
** Function: puntuar()
** Inputs:  An identifier and an integer.
** Return:  True.
**
** Description:
** It gets the score of a multiple choice question and only answer.
**
*******************************************************************************/
function puntuar(iden, ent, nPR){
	var validado=validacion(iden);
	var contestada = "";
	var res = "";
	var corr= miRTE.getInteractionsCorrectRespPattern(ent,0);
	var opt=document.getElementsByName(iden[0].name);
		if (validado!=false){		
			for(var i=0; i<opt.length;i++){
				if(opt[i].checked){
					puntuacion+= parseFloat(opt[i].getAttribute("puntos"));
					contestada = opt[i].value;					
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
		//Actualizamos la puntuación y mostramos la siguiente pregunta
		if (corr.localeCompare(contestada) == 0)
			res="correct";
		else
			res="incorrect";
		miRTE.setInteractionsResponseAll(ent,contestada,res);
		actualiza(puntuacion, total);
		smoke.alert("La puntuación para el alumno "+miRTE.getLearnerName()+" es de: "+puntuacion+ " puntos");
		muestra(ent,nPR);
		return true;
	
}

/*******************************************************************************
**
** Function: puntuarMul()
** Inputs:  An identifier and an integer.
** Return:  True.
**
** Description:
** It gets the score of a multiple choice question and multiple answer.
**
*******************************************************************************/
function puntuarMul(iden, ent, nPR){
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
		//Actualizamos la puntuación y mostramos la siguiente pregunta
		actualiza(puntuacion, total);
		smoke.alert("La puntuación para el alumno "+miRTE.getLearnerName()+" es de: "+puntuacion+" puntos");
		muestra(ent,nPR);
		return true;
	
}

/*******************************************************************************
**
** Function: validacion()
** Inputs:  An identifier.
** Return:  True or false.
**
** Description:
** It checks whether a form is validated or not.
**
*******************************************************************************/
function validacion(iden){
 var i;
 var ok=0;
var opt=document.getElementsByName(iden[0].name);

 for(i=0; i<opt.length;i++){
	if(opt[i].checked)
  {
   ok=1
  }    
 }

 if(ok==1)
  return true
	else{
		//alert("Debes seleccionar una opcion");
	return false	}
}

/*******************************************************************************
**
** Function: puntuarNum()
** Inputs:  An identifier, an integer and two floats.
** Return:  True.
**
** Description:
** It gets the score of a numeric question.
**
*******************************************************************************/
function puntuarNum(iden, ent, inf, sup, nPR){
		var valor=parseFloat(iden.value);
		var n = getI(iden.name);
		miRTE.setInteractionsResponse(n,valor);
		var puntos=document.getElementsByName(iden.name)[0].getAttribute("puntos");
		if(valor<=sup && valor>=inf)
			puntuacion+=parseFloat(puntos);
		//Deshabilitamos los botones
		document.getElementsByName("valida"+ent)[0].disabled = true;
		document.getElementsByName("borra"+ent)[0].disabled = true;
		document.getElementsByName(iden.name)[0].disabled = true;
		//Actualizamos la puntuación y mostramos la siguiente pregunta
		actualiza(puntuacion, total);
		smoke.alert("La puntuación para el alumno "+miRTE.getLearnerName()+" es de: "+puntuacion+ " puntos");
		muestra(ent,nPR);
		return true;
}

//http://www.w3schools.com/jsref/jsref_split.asp
//https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/String/substr
//http://www.lawebdelprogramador.com/foros/JavaScript/1429850-solucionado-Obtener-el-mayor-y-menor-valor-de-un-array-arreglo.html
//https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/Array/indexOf
/*******************************************************************************
**
** Function: puntuaHuecos()
** Inputs:  An identifier and an integer.
** Return:  True.
**
** Description:
** It gets the score of a cloze question.
**
*******************************************************************************/
function puntuaHuecos(iden, ent){
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
		//Actualizamos la puntuación y mostramos la siguiente pregunta
		actualiza(puntuacion, total);
		smoke.alert("La puntuación para el alumno "+miRTE.getLearnerName()+" es de: "+puntuacion+" puntos");
		muestra(ent,nPR);

		return true;	
	}
	
	//Función para mostrar la siguiente pregunta
function muestra (num,nPR){
	var next = num + 1;
	if (next < nPR){
		var aux = "div"+next;
		document.getElementById(aux).style.display = "block";
		var id = document.getElementById("formulario"+next).getElementsByTagName("input")[0].getAttribute("name");
		var tipo = document.getElementById("formulario"+next).getAttribute("tipo");
		var desc = document.getElementById("formulario"+next).getElementsByTagName("h3")[0].outerText;
		
		if (document.getElementById("formulario"+next).getAttribute("tipo").localeCompare("SINGLE CHOICE QUESTION") == 0){
		patt = obtieneCorrectaInv(document.getElementById("formulario"+next).getElementsByTagName("input")[0].getAttribute("name"),document.getElementById("formulario"+next).getAttribute("tipo"));		
		miRTE.setInteractionsAddAll(id,"choice",1,desc,patt);
		} else 
			if (document.getElementById("formulario"+next).getAttribute("tipo").localeCompare("MULTIPLE CHOICE QUESTION") == 0){
			patt = obtieneCorrectaInv(document.getElementById("formulario"+next).getElementsByTagName("input")[0].getAttribute("name"),document.getElementById("formulario"+next).getAttribute("tipo"));		
			miRTE.setInteractionsAddAll(id,"choice",1,desc,patt);
			}
		
	}
}

	//Función para actualizar la puntuación en el div
function actualiza (pts, sum){
	document.getElementById("tupuntuacion").value = pts+"/"+sum;
}

function obtieneCorrectaInv(iden, tipo){
	var opt=document.getElementsByName(iden);
	var correcta = "";
	if (tipo.localeCompare("SINGLE CHOICE QUESTION") == 0){
		var arr = [];
			for(var i=0; i<opt.length;i++){
						arr[i] = parseFloat(opt[i].getAttribute("puntos"));							
					
				} 
				correcta = opt[arr.indexOf(Math.max(...arr))].value;
	} else 
		if (tipo.localeCompare("MULTIPLE CHOICE QUESTION") == 0){
			for(var i=0; i<opt.length;i++){
					if (parseFloat(opt[i].getAttribute("respondida")) > 0){
						if (i==0)
							correcta = opt[i].value;
						else
							correcta = correcta.concat("[,]",opt[i].value);
					}
						
				} 
		}
	return correcta;
			}

//https://gist.github.com/andrei-m/982927
/*******************************************************************************
**
** Function: getEditDistance()
** Inputs:  Two strings.
** Return:  An integer that represents the Levenshtein distance between the two strings.
**
** Description:
** It gets the Levenshtein distance between the two strings given.
**
*******************************************************************************/
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
