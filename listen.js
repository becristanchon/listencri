
var contadorelementos = 0;

var registrovalidado = false; 
$(document).ready(function () {


    /** obetiene ip del usuario */
    var ipusario = "";
    $.getJSON("https://api.ipify.org/?format=json", function (e) { ipusario = e.ip; });
    
    /*captura ruta y hora en la que esat el usaurio actualmente*/
    var urlactual = window.location.pathname;
    var urlhour = [urlactual, obtenerhora()];
    var retrievedObject = "";

    /*se declara una variable de session la cual contendra el objeto json */
    if (sessionStorage.getItem('LogAction') == null) { sessionStorage.setItem('LogAction', "");  }

    retrievedObject = sessionStorage.getItem('LogAction');


    var Jsonv = "";
    var Jsonvbase = {
        "logUsuario": {
            // rutas en las que se   ha  accedido 
            "Rutas": [
                {
                    "ruta": "",
                    "time": ""
                }
            ],
            // botones acciones 
            "Buttonclick": [
                {
                    "timeandview": ["", ""],
                    "id": "",
                    "text": ""
                }
            ],
            //  se deberia registrar   uno cada ves que se  detecte un onchangue 
            "inputswords": [
                {

                    "timeandview": ["", ""],
                    "id": "",
                    "text": ""

                }
            ],
            "ahrefclicks": [
                {

                    "timeandview": ["", ""],
                    "text": ""

                }
            ]
        }
    };

     /* obtener la url en las que se ha navegado*/
    if (retrievedObject != "") { Jsonv = JSON.parse(retrievedObject); getUrlSites(Jsonv, urlhour); } else { Jsonv = Jsonvbase; }


    sessionStorage.setItem('LogAction', JSON.stringify(Jsonv));
    /*obtener los clicks realizados  en botones*/
    $("button").on("click", function () {
        var urlhourclick = [urlactual, obtenerhora()];
        retrievedObject = sessionStorage.getItem('LogAction');
        Jsonv = JSON.parse(retrievedObject)
        /*obtener los clicks realizados  en botones */
        getClickinButtons(Jsonv, urlhourclick, this.id, this.textContent);

    });
    /*obtener los clicks realizados  en inputs de tipo  boton */
    $("input[type='button']").on("click", function () {

        var urlhourclick = [urlactual, obtenerhora()];
        retrievedObject = sessionStorage.getItem('LogAction');
        Jsonv = JSON.parse(retrievedObject)

        getClickinButtons(Jsonv, urlhourclick, this.id, this.value);

    });
    /*obtener los clicks realizados  en href */
    $("a").on("click", function () {
        var urlhourclick = [urlactual, obtenerhora()];
        retrievedObject = sessionStorage.getItem('LogAction');
        Jsonv = JSON.parse(retrievedObject);
        var text = "";
        try {
            text = this.attributes.href.value;
        }
        catch (err) {
            text = "";
        }

        getahrefButtons(Jsonv, urlhourclick, text);
    });
    /*obtener las palabras escritas en input */
    $("input").change(function (event) {
        // var wordininput = [urlhour, "", ""];
        var urlhourclick = [urlactual, obtenerhora()];
        retrievedObject = sessionStorage.getItem('LogAction');
        Jsonv = JSON.parse(retrievedObject)
        getinputswords(Jsonv, urlhourclick, event.target.id, $("#" + event.target.id).val());
    });
    /*detectar cuando se borra y guardar el texto  */
    $(document).keydown(function (e) {
        if (e.keyCode == 8 || e.keyCode == 46) {
            var urlhourclick = [urlactual, obtenerhora()];
            retrievedObject = sessionStorage.getItem('LogAction');
            Jsonv = JSON.parse(retrievedObject)
            getinputswords(Jsonv, urlhourclick, event.target.id, $("#" + event.target.id).val());
        }
    });


    /*se realiza  un evio de  los datos recolectados  cada determinado  tiempo*/
    setInterval(enviardatos, 30000);
    /**  se envian datos recolectados  y se   crea un nuevo obejto vavio  tambien se valida que  se realizaran acciones por el susuario  */
    function enviardatos() {

        validaractividad(Jsonv);

        var myJSON = JSON.stringify(Jsonv);
       
        if (registrovalidado) {

            $.ajax({
                method: "POST",
                url: rutaGlobal + "/Batch/LogActionUser",
                data: { actions: myJSON, ip: ipusario },
                dataType: "json",
                success: function (data) {

                }
            });


        }
        
        retrievedObject = "";
        sessionStorage.removeItem('LogAction');
        sessionStorage.setItem('LogAction', JSON.stringify(Jsonvbase));
        retrievedObject = sessionStorage.getItem('LogAction');
        Jsonv = JSON.parse(retrievedObject);
    }
});

function getUrlSites(Jsonv,urlhour) {


    for (var key in Jsonv) {

        var urlhouractual = Jsonv.logUsuario.Rutas;
        urlhouractual.push(urlhour);
        Jsonv.logUsuario.Rutas = urlhouractual;
      
    }
    

}
function getClickinButtons(Jsonv, urlhour,id,text) {
   
    
    for (var key in Jsonv) {

        var buttonclick = [urlhour, id, text];
        var buttonsactual = Jsonv.logUsuario.Buttonclick;
        buttonsactual.push(buttonclick);
        Jsonv.logUsuario.Buttonclick = buttonsactual;

    }
    sessionStorage.setItem('LogAction', JSON.stringify(Jsonv));


}
function getahrefButtons(Jsonv, urlhour,text) {
    for (var key in Jsonv) {

        var buttonclick = [urlhour,text];
        var buttonsactual = Jsonv.logUsuario.ahrefclicks;
        buttonsactual.push(buttonclick);
        Jsonv.logUsuario.ahrefclicks = buttonsactual;

    }
    sessionStorage.setItem('LogAction', JSON.stringify(Jsonv));
}
function getinputswords(Jsonv, urlhour, id, text) {

    for (var key in Jsonv) {

        var wordininput = [urlhour, id, text];
        var inputssactual = Jsonv.logUsuario.inputswords;
        inputssactual.push(wordininput);
        Jsonv.logUsuario.inputswords = inputssactual;

    }
    sessionStorage.setItem('LogAction', JSON.stringify(Jsonv));

}
function obtenerhora() {
    var horaobject = new Date();
    var hora = horaobject.getHours();
    var minutos = horaobject.getMinutes();
    var segundos = horaobject.getSeconds();
    var time = hora + ":" + minutos + ":" + segundos;

    return time;
}
function GetUserIP() {
    var ret_ip;
    $.ajaxSetup({ async: false });
    $.get('http://jsonip.com/', function (r) {
        ret_ip = r.ip;
    });
    return ret_ip;
}
function validaractividad(Jsonv) {
    /*contar url sites*/
    contadorelementos = 0;
    for (var key in Jsonv.logUsuario.Rutas) {contadorelementos++;}
    /*contar  butttonclick */
    for (var key in Jsonv.logUsuario.Buttonclick) {contadorelementos++;}
    /*contar  hrefs */
    for (var key in Jsonv.logUsuario.ahrefclicks) {contadorelementos++; }
    /*contar  inputs */
    for (var key in Jsonv.logUsuario.inputswords) {contadorelementos++;}
    /*agrega variable  para aceptar el envio  del registro */
    if (contadorelementos > 4) {   registrovalidado = true;  } else { registrovalidado = false;}

}
