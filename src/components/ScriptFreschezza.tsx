/**
 * Nasconde le date passate PRIMA del primo paint.
 *
 * Deliberatamente non è React: uno useEffect girerebbe dopo l'idratazione e
 * mostrerebbe per un attimo le date scadute, e un filtro in fase di render
 * romperebbe l'idratazione contro l'HTML pre-renderizzato. Questo script viene
 * eseguito dal parser, subito dopo il markup che tocca.
 *
 * Nessuna dipendenza dal bundle: funziona anche se il JS di Next non arriva.
 */
const SCRIPT = `(function(){
try{
var oggi=new Date().toLocaleDateString('en-CA',{timeZone:'Europe/Rome'});

// 1. Elenco date: via quelle finite.
var righe=document.querySelectorAll('[data-elenco-date] li[data-fine]');
for(var i=0;i<righe.length;i++){if(righe[i].dataset.fine<oggi){righe[i].hidden=true;}}

// 2. Mesi rimasti senza righe visibili.
var mesi=document.querySelectorAll('[data-gruppo-mese]');
var restano=0;
for(var j=0;j<mesi.length;j++){
  if(mesi[j].querySelector('li[data-fine]:not([hidden])')){restano++;}
  else{mesi[j].hidden=true;}
}

// 3. Calendario vuoto: mostra il messaggio, nascondi il download.
if(restano===0){
  var vuoto=document.querySelector('[data-nessuna-data]');
  if(vuoto){vuoto.hidden=false;}
  var tutte=document.querySelector('[data-tutte-le-date]');
  if(tutte){tutte.hidden=true;}
}

// 4. Carta in testa: scopri il primo mercato non finito.
var voci=document.querySelectorAll('[data-voce-prossimo]');
var scelta=null;
for(var k=0;k<voci.length;k++){if(voci[k].dataset.fine>=oggi){scelta=voci[k];break;}}
if(scelta){
  var vuotoP=document.querySelector('[data-nessun-prossimo]');
  if(vuotoP){vuotoP.hidden=true;}
  scelta.hidden=false;
  if(scelta.dataset.inizio<=oggi){
    var et=scelta.querySelector('[data-etichetta-prossimo]');
    if(et){et.textContent=et.dataset.oggi||et.textContent;}
  }
}
}catch(e){}
})();`;

export function ScriptFreschezza() {
	// Il rule noDangerouslySetInnerHtml è disattivata per questo file in biome.json:
	// lo script deve girare durante il parsing, prima dell'idratazione.
	return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
