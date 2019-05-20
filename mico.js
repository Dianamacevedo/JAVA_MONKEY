//Variables globales
var velocidad = 80;
var desplazamiento = 7;
var superficie = 267;
var nbasura = 600;
var bucle;
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var ancho = canvas.width;
var alto = canvas.height;
var modal = document.getElementById("modal");


//Clases
class Objeto {
	constructor(){
		this.img = document.createElement("img");
	}
	choque(otro){
		if(this.fondo < otro.techo || this.techo > otro.fondo || this.derecha < otro.izquierda || this.izquierda > otro.derecha){
			return false;
		} else {
			return true;
		}
	}
}	

class Mundo {
	constructor(){
		this.x = 0;
		this.y = superficie;
		this.tamano = 15000;
		this.espacio = 32;
		this.img = document.createElement("img");
		this.img.src = "imagenes/mundo.png";
		
		this.imgFondo = document.createElement("img");
		this.imgFondo.src = "imagenes/fondo.png";
		this.nx = 0;
		this.ny = 15;
		this.nd = 250;
	}
	dibujar(){
		var tx = this.x;
		for(var i=0; i<=this.tamano;i++){
			ctx.drawImage(this.img, tx, this.y);
			tx+=this.espacio;
		}
		var tnx = this.nx;
		for(var i=0; i<=this.tamano;i++){
			ctx.drawImage(this.imgFondo, tnx, this.ny);
			tnx+=this.nd;
		}
	}
	mover(){
		this.x-=desplazamiento;
		this.nx-=2;
	}
}
class Monkey extends Objeto {
	constructor(){
		super();
		this.x = 35;
		this.w = 70;
		this.h = 75;
		this.y = superficie-this.h;
		this.img.src = "imagenes/mico.png";
		
		this.techo = this.y;
		this.fondo = this.y+this.h-15;
		
		this.bordeDerecha = 30;
		this.bordeIzquierda = 50;
		this.derecha = this.x+this.w-this.bordeDerecha;
		this.izquierda = this.x+this.bordeIzquierda;
		
	}
	dibujar(){
		ctx.drawImage(this.img, this.x, this.y);
	}
	actualizarBordes(){
		this.techo = this.y;
		this.fondo = this.y+this.h+10;
	}
}

class Basura extends Objeto {
	constructor(x){
		super();
		this.x = x;
		this.hmin = 30;
		this.hmax = 50;
		this.h = this.generar(this.hmin, this.hmax);
		this.w = this.h*(0.80);
		this.y = superficie-this.h;
		this.nmin = 1;
		this.nmax = 3;
		this.n = this.generar(this.nmin, this.nmax);
		this.dmin = 250;
		this.dmax = 400;
		this.d = this.generar(this.dmin, this.dmax);
		this.siguiente = null;
		this.img.src = "imagenes/basura.png";
		
		this.techo = this.y;
		this.fondo = this.y+this.h;
		this.derecha = this.x+this.w;
		this.izquierda = this.x;
	}
	dibujar(){
		var tx = this.x;
    		for(var i=0;i<this.n;i++){
			ctx.drawImage(this.img, tx, this.y, this.w, this.h);
			tx+=this.w;
			this.derecha = tx;
		}
		if(this.siguiente != null){
			this.siguiente.dibujar();
		}
	}
	mover(){
		this.x-=desplazamiento;
		this.izquierda = this.x;
		if(this.siguiente != null){
			this.siguiente.mover();
		}
	}
	agregar(){
		if(this.siguiente == null){
			this.siguiente = new Basura(this.x+this.d);
		} else{
			this.siguiente.agregar();
		}
	}
	generar(a,b){
		return Math.floor((Math.random() * b) + a);
	}
	verSiguiente(){
		return this.siguiente;
	}
}
class Tiempo {
	constructor(){
		this.nivel = 0;
		this.tiempo = 0;
		this.limite = 1000;
		this.intervalo = 1000/velocidad;
		
		this.sonido = document.createElement("audio");
		this.sonido.src = "imagenes/aviso.mp3";
	}
	dibujar(){
		ctx.font = "25px Arial";
		ctx.fillText(this.nivel.toString(), 550, 40);
	}
	
	tick(){
		this.tiempo+=this.intervalo;
		if(this.tiempo >= this.limite){
			this.tiempo = 0;
			this.nivel++;
			this.sonido.play();
			velocidad-=3;
			velocidadSalto-=2;
			this.intervalo = Math.floor(1000/velocidad);
			clearInterval(bucle);
			bucle = setInterval("frame()", velocidad);
		}
	}
	
}
//Objetos
var mundo = new Mundo();
var Monk = new Monkey();
var basura = new Basura(600);
for(i=0;i<=nbasura;i++){
	basura.agregar();
}
var tiempo;
//funciones de control
var velocidadSalto = 60;
var desplazamientoSalto = 5;
var puedeSaltar = true;
var salto;
function subir(){
	Monk.y-=desplazamientoSalto;
	Monk.actualizarBordes();
	if(Monk.y <= 2){
		clearInterval(salto);
		salto = setInterval("bajar()", velocidadSalto);
	}
}
function bajar(){
	Monk.y+=desplazamientoSalto;
	Monk.actualizarBordes();
	if(Monk.y >= (superficie-Monk.h)){
		clearInterval(salto);
		puedeSaltar = true;
	}
}
function iniciarSalto(){
	salto = setInterval("subir()", velocidadSalto);
	puedeSaltar = false;
}

function saltar(event){
	if(event.keyCode == 38){
		if(puedeSaltar){
			iniciarSalto();
		}
	}
}
function findeJuego(){
	clearInterval(bucle);
	modal.style.display = "block";
	document.getElementById("imgbtn").src = "imagenes/otravez.png";
	mundo = new Mundo();
	Monk = new Monkey();
	velocidad = 50;
	velocidadSalto = 50;
	basura = new Basura(600);
	for(i=0;i<=nbasura;i++){
	basura.agregar();
	}
}
function choqueBasura(){
	var temp = basura;
	while(temp != null){
		if(temp.choque(Monk)){
			//fin de juego
			findeJuego();
			break;
		} else {
			temp = temp.verSiguiente();
		}
	}
}
function destruirBasura(){
	if(basura.derecha < 0){
		basura = basura.verSiguiente();
	}
}
//funciones globales
function dibujar(){
	ctx.clearRect(0,0,ancho, alto);
	mundo.dibujar();
	Monk.dibujar();
	basura.dibujar();
	tiempo.dibujar();
}
function frame(){
	dibujar();
	mundo.mover();
	basura.mover();
	tiempo.tick();
	choqueBasura();
	destruirBasura();
}
function iniciar(){
	modal.style.display = "none";
	bucle = setInterval("frame()", velocidad);
	tiempo = new Tiempo();
}



