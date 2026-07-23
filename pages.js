var pages = [3, 25, 23, 25, 23, 24, 21, 22, 20, 17, 22, 21, 23, 24, 33, 30, 34]; // chapter pages
var url = null;
var pdfDoc = null;
var canvas = null;
var ctx = null;
var chpt = 0;		// chapter number
var bookPn = 1;		// book page number
var chapPn = 1;		// chapter page number

window.onload = main;
   
function main() {
	canvas = document.getElementById("pdfCanvas");
	ctx = canvas.getContext("2d");

	document.getElementById('btnL').addEventListener("click", prevPage);
	document.getElementById('btnR').addEventListener("click", nextPage);
	document.getElementById('pnum').addEventListener("keydown", gotoPage);
	document.addEventListener('contextmenu', (e) => {
		e.preventDefault();
	});

	let params = new URLSearchParams(document.location.search);
	chpt = params.get("chpt");			// first, try url parameters
	if (chpt == null) {					// no parameters
		let page = getCookie("page");	// then try cookie
		//chpt = getCookie("chpt");
		if (page == null) {				// no parameters or cookies
			chpt = 0;
			bookPn = 1;
			chapPn = 1;
		} else {						// has cookie
			bookPn = page;
			let info = getPageInfo();
			chpt = info[0];
			chapPn = info[1];
		}		
	} else {							// has url parameters
		chapPn = params.get("page");
		if (chapPn == null) chapPn = 1;
		bookPn = getBookPage(chpt, chapPn);
	}

	document.getElementById('pnum').value = bookPn;
	setCookie("page", bookPn, 7);
     
	// Load PDF
	url = "https://gismanray.github.io/book/pdf/Chapter" + ("0"+chpt).slice(-2) + ".pdf";
	pdfjsLib.getDocument(url).promise.then(function(pdf) {
		pdfDoc = pdf;
		renderPage(); // Render initial page
	});
}

function renderPage() {
	if (chapPn == 1 && chpt == 0) {
		document.getElementById('btnL').src = "images/btn-l2.png";
		document.getElementById('btnL').title = "Book beginning";
	} else {
		document.getElementById('btnL').src = "images/btn-l1.png";
		document.getElementById('btnL').title = "Previous page";
	}
	if (chapPn == pdfDoc.numPages && chpt == 16) {
		document.getElementById('btnR').src = "images/btn-r2.png";
		document.getElementById('btnR').title = "Book end arrived";
	} else {
		document.getElementById('btnR').src = "images/btn-r1.png";
		document.getElementById('btnR').title = "Next page";
	}

	if (chpt == 0) {
		document.getElementById('chlbl').innerText = "Introduction";
		} else {
			document.getElementById('chlbl').innerText = "Chapter " + chpt;
		}
		document.getElementById('pnum').value = bookPn;

		pdfDoc.getPage(parseInt(chapPn)).then(function(page) {
		const scale = 1.40;
		const viewport = page.getViewport({ scale: scale });

		canvas.width = viewport.width;
		canvas.height = viewport.height;

		const renderContext = {
			canvasContext: ctx,
			viewport: viewport
		};

		page.render(renderContext);
	});
}

function prevPage() {
	if (bookPn == 1) return;
	bookPn--;
	setCookie("page", bookPn, 7);
	const info = getPageInfo();
	chapPn = info[1];
	
	if (chpt == info[0]) {	// chapter not changed
		renderPage();
	} else {
		chpt = info[0];
		url = "https://gismanray.github.io/book/pdf/Chapter" + ("0"+chpt).slice(-2) + ".pdf";
		pdfjsLib.getDocument(url).promise.then(function(pdf){
			pdfDoc = pdf;
			renderPage();
		});
	}
}
    
function nextPage() {
	if (bookPn >= 390) return;
	bookPn++;
	setCookie("page", bookPn, 7);
	const info = getPageInfo();
	chapPn = info[1];
	
	if (chpt == info[0]) {	// chapter not changed
		renderPage();
	} else {
		chpt = info[0];
		url = "https://gismanray.github.io/book/pdf/Chapter" + ("0"+chpt).slice(-2) + ".pdf";
		pdfjsLib.getDocument(url).promise.then(function(pdf){
			pdfDoc = pdf;
			renderPage();
		});
	}
}

function gotoPage(e) {
	if (e.key != 'Enter') return;
	const snum = document.getElementById('pnum').value;
	if (isNaN(parseInt(snum))) {
		alert("Invalid page number");
		return;
	}
	const num = parseInt(snum);
	if (num < 1 || num > 390) {
		alert("Page number out or range");
		return;
	}
	if (num == bookPn) return;		// page number not changed
	
	bookPn = num;
	setCookie("page", bookPn, 7);
		
	const info = getPageInfo();
	chapPn = info[1];
	if (chpt == info[0]) {		// chapter not changed
		renderPage();
	} else {
		chpt = info[0];
		url = "https://gismanray.github.io/book/pdf/Chapter" + ("0"+chpt).slice(-2) + ".pdf";
		pdfjsLib.getDocument(url).promise.then(function(pdf){
			pdfDoc = pdf;
			renderPage();
		});
	}
}

function getPageInfo() {
	let chn = 0, pn = 1;
	for (let i=0; i<=16; i++) {
		const chPE = pages.slice(0, i+1).sum();	// chapter end page number
		const chPS = chPE - pages[i] + 1;		// chapter starting page number
		//console.log("chPE: " + chPE + "; chPS: " + chPS + "; bookPn: " + bookPn);
		if (bookPn <= chPE) {
			chn = i;
			pn = bookPn - chPS + 1;
			break;
		}
	}
	chpn = [chn, pn];
	return chpn;
}

function getBookPage(ch, pn) {
	if (ch == 0) {
		return pn;
	} else {
		return pages.slice(0, ch).sum() + parseInt(pn);
	}
}

Array.prototype.sum = function() {
	return this.reduce((sum, val) => sum + val, 0);
};

function setCookie(name, value, days) {
	let expires = "";

	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		expires = "; expires=" + date.toGMTString();
	} else {
		expires = "";
	}
	document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/";
}

function getCookie(name) {
	var nameEQ = encodeURIComponent(name) + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) === ' ') c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
	}
	return null;
}

function eraseCookie(name) {
	setCookie(name, "", -1);
}
