"use strict";
const BYTES_PER_CHUNK = 1200;
var mconn;

  var incomingFileInfo;
	var incomingFileData;
	var bytesReceived;
  var downloadInProgress = false;
	var shareurl;
	var chunkSize;
	var totalByteSend;
 $(document).ready(function() {
	 totalByteSend=0;
		chunkSize=0;
	  $("div#divLoading").addClass('show');
$("#srvstatus").css("color", "red");
var connectedPeers = {}; 
var peer = new Peer({host: 'filesendo.herokuapp.com',port:"",path:"/",secure:true},);
pingPeerServer();
var reciveid=window.location.hash.substring(1);

peer.on('open', function(id) {
	
  console.log('uID: ' + id);
  $("#cnnt").fadeOut();
	
	$("#srvstatus").css("color", "#00ab23");
	if  (!reciveid)
	  {
			$("#senderid").fadeIn();
		  $("#shareurl").val("https://rupeshs.github.io/filesendo/index.html#"+id);
		 shareurl="https://rupeshs.github.io/filesendo/index.html#"+id;
		 console.log( shareurl);
		}


});


peer.on('error', function(err) {
  console.log(err);
});


peer.on('disconnected', function(close) {
	 $("#srvstatus").css("color", "red");
	 console.log("Grr...lost connection");
	
});
function pingPeerServer() {
	 console.log("PING");
    peer.socket.send({type: 'ping'});
    var timeoutID = setTimeout(pingPeerServer,30000);
}
 
//listen for the connection event
peer.on('connection', function(conn) { 
	 $('#receiver').fadeIn();
	  $('#client').fadeIn();
	 $('#receiver').html("<p>Receiver connected <span class=\"badge badge-primary\">"+conn.peer+"</span</p>");
	 $("#senderc").fadeIn();
  mconn=conn;
  console.log(conn);
 conn.on('data', function(data) {
    console.log('Received', data);
  });
  conn.on('open', function() {
  // Receive messages
  console.log("connection ok");
  //alert("fdgf");
  //conn.send('Hello!');
 
 
  // Send messages
  
});

});




if (reciveid)
{
  console.log("connect to sender");
  var conn = peer.connect(reciveid);
   conn.on('error', function(err) { alert(err); });
   conn.on('data', function(data) {
    //console.log('Receivedsss', data);
     if( downloadInProgress === false ) {
        startDownload( data );
    } else {
        progressDownload( data );
    }
  });
}


 $("#sharecopy").click(function() {
    $("#shareurl").select();
   document.execCommand('copy');
   toastr.success('URL copied',{timeOut: 3000});
    });

   $("#sharewhatsapp").click(function() {
        window.open("whatsapp://send?text="+shareurl);
    });
   

$("#sharemail").click(function() {
        window.open("mailto:name@mail.com?subject=SendFileo%3Adownload%20file&amp;body="+shareurl);
    });
      

  });

  function sendData()
 {
   mconn.send('fine');
 }
  /**
	 * File Handling
	 */
	var file;
	var currentChunk;

	var fileInput = $( 'input[type=file]' );
	var fileReader = new FileReader();
 
	fileReader.onload = sendNextChunk;
	fileInput.on( 'change', startTransfer );

	function startTransfer() {
		totalByteSend=0;

		
		 $('#sendpg').fadeIn();
		file = fileInput[ 0 ].files[ 0 ];
	
		$('#sendInfo').html(file.name+"("+formatBytes(file.size)+")");
		currentChunk = 0;
	   mconn.send(JSON.stringify({
			fileName: file.name,
			fileSize: file.size
		}));
		readNextChunk();
  }
  
  function readNextChunk() {
		var start = BYTES_PER_CHUNK * currentChunk;
		var end = Math.min( file.size, start + BYTES_PER_CHUNK );
		 chunkSize=end-start;
		fileReader.readAsArrayBuffer( file.slice( start, end ) );
	}

	function sendNextChunk() {
	
		 totalByteSend=totalByteSend+chunkSize;
			$(".progress-bar ").css("width",  ((totalByteSend / file.size ) * 100).toFixed( 2 ) + '%' );
		$('#sendStatus').html( "Bytes sent "+totalByteSend	+" / "+file.size);
	  mconn.send( fileReader.result );
		currentChunk++;

		if( BYTES_PER_CHUNK * currentChunk < file.size ) {
			readNextChunk();
		}
  }
  




	

	function startDownload( data ) {
		incomingFileInfo = JSON.parse( data.toString() );
		incomingFileData = [];
		bytesReceived = 0;
		downloadInProgress = true;

		$('#receiveInfo').html("Receiving "+incomingFileInfo.fileName+"("+formatBytes(incomingFileInfo.fileSize)+")");
		$('#receinfo').fadeIn();
		$('#recepg').fadeIn();
	
	//	console.log( 'incoming file <b>' + incomingFileInfo.fileName + '</b> of ' + incomingFileInfo.fileSize + ' bytes' );
	}

	function progressDownload( data ) {
		bytesReceived += data.byteLength;
		incomingFileData.push( data );
		console.log( 'progress: ' +  ((bytesReceived / incomingFileInfo.fileSize ) * 100).toFixed( 2 ) + '%' );
			$("#recepb").css("width",((bytesReceived / incomingFileInfo.fileSize ) * 100).toFixed( 2 ) + '%');
		  $('#receStatus').html( "Bytes received "+bytesReceived	+" / "+incomingFileInfo.fileSize);
			if( bytesReceived === incomingFileInfo.fileSize ) {
			endDownload();
		}
	}

	function endDownload() {
		downloadInProgress = false;
		var blob = new window.Blob( incomingFileData );
		var anchor = document.createElement( 'a' );
		anchor.href = URL.createObjectURL( blob );
		anchor.download = incomingFileInfo.fileName;
		anchor.textContent = 'Download here';

		if( anchor.click ) {
			anchor.click();
		} else {
			var evt = document.createEvent( 'MouseEvents' );
			evt.initMouseEvent( 'click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null );
			anchor.dispatchEvent( evt );
		}
  }
  
  $("#copybtn").click(function(){
   
});

function formatBytes(a,b){if(0==a)return"0 Bytes";var c=1024,d=b||2,e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],f=Math.floor(Math.log(a)/Math.log(c));return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f]}