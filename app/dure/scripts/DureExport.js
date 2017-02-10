/*********  File contains functionality for the Image Exoprt *********/


var DureExport = {};
var layerQueue;
var mainCanvas;

DureExport.getExportCallElement = function (map) {
window.scrollTo(0, 0);            // if body content in middle then html2canvas produce half cut image or blank for legend (TODO)
 $('div.blockui').block({ 
          message: '<h5>Please Wait while downloading...</h5>', 
          css: { 
           border: 'none', 
           padding: '15px', 
           backgroundColor: '#000', 
           '-webkit-border-radius': '10px', 
           '-moz-border-radius': '10px', 
           opacity: .5, 
           color: '#fff' 
         }
});

var dimensions = map.getSize();
mainCanvas = document.createElement('canvas');
mainCanvas.width = dimensions.x;
mainCanvas.height = dimensions.y;   
var ctx = mainCanvas.getContext('2d');
ctx.fillStyle = '#e2eaff';
ctx.fillRect(0, 0,  dimensions.x, dimensions.y);           
var canvas1 = $('<canvas/>', { id: 'mycanvas', height: dimensions.y, width: dimensions.x});
canvas1.css('border', 'solid 1px white');
$('body').append(canvas1); 

var renderLegend = function(i, callback) {
  if(!$('.scaleWrap .box-body').is(':visible')) $('.collapsibleHeader button').trigger('click');  // if legend is hide then show it 
  $(".legend-info h5").hide();
  $(".legend-info").css("background-color", "#e2eaff"); 
    html2canvas($(".legend-info")[0], {
      //background: undefined,
        //allowTaint: true,
      onrendered: function(canvas) {
        var img = canvas.toDataURL();
        callback(null, {
                         imgURL: img,
                         x: 5,
                         y: dimensions.y - $(".legend-info").height() - 65,
                         width:$(".legend-info").width(),
                         height:$(".legend-info").height()
                    });
        $(".legend-info").css("background-color", ""); 
        $(".legend-info h5").show();
      }
   });

}

var markerLegend = function(i, callback) {
        html2canvas($("#marker-legend"), {
          onrendered: function(canvas) {
            var overlaylegend = canvas.toDataURL("image/png");
            
            callback(null, {
              imgURL: overlaylegend,
              x: 10,
              y: $(".legend-info").height() + 50,
              width:$("#marker-legend").width(),
              height:$("#marker-legend").height()
            });
          }
        });
}


var filterlegend = function(i, callback) {
  html2canvas($(".legendPrintGrid"), {
          onrendered: function(canvas) {
            var overlaylegend = canvas.toDataURL("image/png");
            
            callback(null, {
              imgURL: overlaylegend,
              x: 10,
              y: $(".legend-info").height() +  50 + ($("#marker-legend").height() || 0) + ($("#gavi-pattern-legend").height() || 0),
              width:$(".legendPrintGrid").width(),
              height:$(".legendPrintGrid").height()
            });
          }
        });
}

var gavilegend = function(i, callback) {
  html2canvas($("#gavi-pattern-legend"), {
          onrendered: function(canvas) {
            var gavi= canvas.toDataURL("image/png");            
            callback(null, {
              imgURL: gavi,
              x: 4,
              y: $(".legend-info").height() +  50 + ($("#marker-legend").height() || 0),
              width:$("#gavi-pattern-legend").width(),
              height:$("#gavi-pattern-legend").height() + 20
            });
          }
        });
}


var controlScale = function(i, callback) {
  html2canvas($(".leaflet-control-graphicscale"), {
          onrendered: function(canvas) {
            var scale = canvas.toDataURL("image/png");            
            callback(null, {
              imgURL: scale,
              x: dimensions.x - 250,
              y: dimensions.y - 100,
              width:$(".leaflet-control-graphicscale").width(),
              height:$(".leaflet-control-graphicscale").height() 
            });
          }
        });
}

var renderTitle = function(i, callback) {

  ctx.fillStyle="#bfd3fe";
  ctx.fillRect(0,0,dimensions.x,40);
  ctx.fillStyle="#FFFFFF";
  ctx.fillRect(0,40,dimensions.x,10);
  ctx.font = "bold  13px verdana, sans-serif";
  ctx.fillStyle = "black";
  var indicatorTitle = dureUtil.indicatorNameInfoExt;
  var indicatorTitleWidth = ctx.measureText(indicatorTitle).width;
  // wrapText(context, text, x, y, maxWidth, lineHeight);
  wrapText(ctx, indicatorTitle, 50, 15, dimensions.x - 50, 16);
  //var targetName = $("#I_" + dureUtil.indicatorId).parent().parent().prev().text() + ' - '  || '';
  //var indicatorName = dureUtil.indicatorName.trim();
  //var targetNameWidth = ctx.measureText(targetName).width;
  //var indicatorNameWidth =  ctx.measureText(indicatorName).width;
  //ctx.fillText(targetName +" "+indicatorName, 10 ,30); 
    //ctx.fillText(targetName + " " + indicatorName, 10 ,30);  // target group name and indicator name
  ctx.font = "bold  20px verdana, sans-serif";
  var breadCum = dureUtil.getDataLevel() == "world" ? '' : dureUtil.getDataLevel() == "country" ?  province.countryName : dureUtil.getDataLevel() == "province"  ?   province.countryName  + " / " + subprovince.provinceName: " ";

  ctx.fillText( breadCum, 54, 70);  // geographic level
  ctx.fillStyle="#FFFFFF";
  ctx.fillRect(0,dimensions.y - 55, dimensions.x, 55);
  ctx.fillStyle = "black";
  //** Disclamer start**//

  ctx.font = "normal 9px verdana, sans-serif";
  disclaimerText = [["Disclaimer: The boundaries and names shown and the designations used on this map do not imply the expression of any"],["opinion whatsoever on the part of the World Health Organization concerning the legal status of any country, territory, city"],[ "or area or of its authorities, or concerning the delimitation of its frontiers or boundaries.Dotted and dashed lines on maps"],["represent approximate border lines for which there may not yet be full agreement."]];
  ctx.fillText(disclaimerText[0][0], 5 ,dimensions.y - 40);  
  ctx.fillText(disclaimerText[1][0], 5 ,dimensions.y - 30);  
  ctx.fillText(disclaimerText[2][0], 5 ,dimensions.y - 20);  
  ctx.fillText(disclaimerText[3][0], 5 ,dimensions.y - 10);  
   //** Disclamer end**//

  ctx.fillText('Data Source: World Health Organisation', dimensions.x - 450 ,dimensions.y - 40);  
  ctx.fillText('Map Production: Country Intelligence Database, ', dimensions.x - 450 ,dimensions.y - 30);  
  ctx.fillText('HIV Department, World Health Organization', dimensions.x - 450 ,dimensions.y - 20);  
  ctx.font = '9px FontAwesome';  
  ctx.fillText(String.fromCharCode("0xf1f9"), dimensions.x - 151, dimensions.y - 10); 
  ctx.font = "normal 9px verdana, sans-serif";
  var d = new Date();
  var n = d.getFullYear();
  var copyRightOwner = ' WHO ' + n + ' All rights reserved';
  ctx.fillText(copyRightOwner, dimensions.x - ctx.measureText(copyRightOwner).width - 5 , dimensions.y - 10); 
  var appLogoImage = new Image();
    appLogoImage.onload = function() {
     
      ctx.drawImage(appLogoImage, dimensions.x - 130, dimensions.y - 50); // App Logo
     
    }
  appLogoImage.src = 'img/who132X27.png';
  //callback(null);
}


var renderMap = function(i, callback) {
        $('.leaflet-overlay-pane svg').removeAttr('xmlns');
     if (!/*@cc_on!@*/
      false) {
      $('.leaflet-overlay-pane').attr('xmlns:xlink', "http://www.w3.org/1999/xlink");
     }
    setTimeout(function () {
        var svg = $('.leaflet-overlay-pane').html();
        window.svg = svg;
        canvg(document.getElementById('mycanvas'), svg, { ignoreClear: false });
            setTimeout(function () {
               var exportImageObj = {};
               exportImageObj.mainCanvas = document.getElementById('mycanvas');
               exportImageObj.context = exportImageObj.mainCanvas.getContext('2d');
               exportImageObj.mapDataURL = exportImageObj.mainCanvas.toDataURL("image/png");
            callback(null, {
                imgURL: exportImageObj.mapDataURL,
                x: 0,
                y: 0,
                width: dimensions.x + 150,
                height: dimensions.y + 100,
                otherAttr:{posX:-200,posY:-140,strWidth:dimensions.x + 150,strHeight:dimensions.y + 100,}
            });
            }, 600);
    }, 700);    
}


var finished = function(error, results) {
  //console.log(results);
    results.forEach(function(layer) {
      //console.log(layer);
      if(layer) {
          var image = new Image();
          image.onload = function() {
            if(layer.otherAttr) {
 
              ctx.drawImage(image,layer.x, layer.y, layer.width, layer.height, layer.otherAttr.posX, layer.otherAttr.posY, layer.otherAttr.strWidth, layer.otherAttr.strHeight);
            } else {
 
              ctx.drawImage(image,layer.x, layer.y, layer.width, layer.height);  
            }

            renderTitle();
          }
            image.src = layer.imgURL;
      }
          
    });
  
  var downloadInterval = setInterval(function() { 
  var mergeImage = mainCanvas.toDataURL('image/jpeg', 1.0);  
  setTimeout(function() {
    var targetName = $("#I_" + dureUtil.indicatorId).parent().parent().prev().text() + '_'  || '';
    var _fileName = 'hivci_' + targetName.toLowerCase().trim().replace(/ /g,"_") + ''+ dureUtil.indicatorName.toLowerCase().trim().replace(/ /g,"_") + "_" + Date.now();
	var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;              // only for safari browser ans user is online (if offline then open in popup allow user to save Manually )send dataURL to server 
	if(isSafari) {
			if(dCore.onlineStatus()) {
				var cs = new CanvasSaver('http://hivci.org/app/downloadfile.php', mergeImage);
				cs.savePNG(_fileName);
			} else {
				window.open(mergeImage);
				$('div.blockui').unblock();
			}
			
	} else {
		download(mergeImage, _fileName, 'image/jpeg'); 
		$('div.blockui').unblock();
	}
	
    $('#mycanvas').remove(); 
  }, 500);
  clearInterval(downloadInterval);
  }, 5000);
  
}


layerQueue = new queue(1);

var renderItems = [
  {fxnName:renderMap, apply:true},
  {fxnName:renderLegend, apply:true},
  {fxnName:markerLegend, apply:$("#marker-legend").html() ? true : false},
  {fxnName:filterlegend, apply:iHealthMap.checkFilter() == 1 ? true : false},
  {fxnName:gavilegend, apply:iHealthMap.isGaviFilterApplied == 1 ? true : false},
  {fxnName:controlScale, apply:true}
  //{fxnName:renderTitle, apply:true}
 // {fxnName:renderMap, apply:true}
];

renderItems.forEach(function( items ) {

  if(items.apply) {
    layerQueue.defer(items.fxnName, 1);
  }

});

  layerQueue.awaitAll(finished);  
        
};


(function() {
  if (typeof module === "undefined") self.queue = queue;
  else module.exports = queue;
  queue.version = "1.0.4";

  var slice = [].slice;

  function queue(parallelism) {
    var q,
        tasks = [],
        started = 0, // number of tasks that have been started (and perhaps finished)
        active = 0, // number of tasks currently being executed (started but not finished)
        remaining = 0, // number of tasks not yet finished
        popping, // inside a synchronous task callback?
        error = null,
        await = noop,
        all;

    if (!parallelism) parallelism = Infinity;

    function pop() {
      while (popping = started < tasks.length && active < parallelism) {
        var i = started++,
            t = tasks[i],
            a = slice.call(t, 1);
        a.push(callback(i));
        ++active;
        t[0].apply(null, a);
      }
    }

    function callback(i) {
      return function(e, r) {
        --active;
        if (error != null) return;
        if (e != null) {
          error = e; // ignore new tasks and squelch active callbacks
          started = remaining = NaN; // stop queued tasks from starting
          notify();
        } else {
          tasks[i] = r;
          if (--remaining) popping || pop();
          else notify();
        }
      };
    }

    function notify() {
      if (error != null) await(error);
      else if (all) await(error, tasks);
      else await.apply(null, [error].concat(tasks));
    }

    return q = {
      defer: function() {
        if (!error) {
          tasks.push(arguments);
          ++remaining;
          pop();
        }
        return q;
      },
      await: function(f) {
        await = f;
        all = false;
        if (!remaining) notify();
        return q;
      },
      awaitAll: function(f) {
        await = f;
        all = true;
        if (!remaining) notify();
        return q;
      }
    };
  }

  function noop() {}
})();



(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.download = factory();
  }
}(this, function () {

    return function download(data, strFileName, strMimeType) {

        var self = window, // this script is only for browsers anyway...
            u = "application/octet-stream", // this default mime also triggers iframe downloads
            m = strMimeType || u,
            x = data,
            D = document,
            a = D.createElement("a"),
            z = function(a){return String(a);},
            B = (self.Blob || self.MozBlob || self.WebKitBlob || z);
            B=B.call ? B.bind(self) : Blob ;
            var fn = strFileName || "download",
            blob,
            fr;


        if(String(this)==="true"){ //reverse arguments, allowing download.bind(true, "text/xml", "export.xml") to act as a callback
            x=[x, m];
            m=x[0];
            x=x[1];
        }




        //go ahead and download dataURLs right away
        if(String(x).match(/^data\:[\w+\-]+\/[\w+\-]+[,;]/)){
            return navigator.msSaveBlob ?  // IE10 can't do a[download], only Blobs:
                navigator.msSaveBlob(d2b(x), fn) :
                saver(x) ; // everyone else can save dataURLs un-processed
        }//end if dataURL passed?

        blob = x instanceof B ?
            x :
            new B([x], {type: m}) ;


        function d2b(u) {
            var p= u.split(/[:;,]/),
            t= p[1],
            dec= p[2] == "base64" ? atob : decodeURIComponent,
            bin= dec(p.pop()),
            mx= bin.length,
            i= 0,
            uia= new Uint8Array(mx);

            for(i;i<mx;++i) uia[i]= bin.charCodeAt(i);

            return new B([uia], {type: t});
         }

        function saver(url, winMode){

            if ('download' in a) { //html5 A[download]
                a.href = url;
                a.setAttribute("download", fn);
                a.innerHTML = "downloading...";
                D.body.appendChild(a);
                setTimeout(function() {
                    a.click();
                    D.body.removeChild(a);
                    if(winMode===true){setTimeout(function(){ self.URL.revokeObjectURL(a.href);}, 250 );}
                }, 66);
                return true;
            }

            if(typeof safari !=="undefined" ){ // handle non-a[download] safari as best we can:
                url="data:"+url.replace(/^data:([\w\/\-\+]+)/, u);
                if(!window.open(url)){ // popup blocked, offer direct download:
                    if(confirm("Displaying New Document\n\nUse Save As... to download, then click back to return to this page.")){ location.href=url; }
                }
                return true;
            }

            //do iframe dataURL download (old ch+FF):
            var f = D.createElement("iframe");
            D.body.appendChild(f);

            if(!winMode){ // force a mime that will download:
                url="data:"+url.replace(/^data:([\w\/\-\+]+)/, u);
            }
            f.src=url;
            setTimeout(function(){ D.body.removeChild(f); }, 333);

        }//end saver




        if (navigator.msSaveBlob) { // IE10+ : (has Blob, but not a[download] or URL)
            return navigator.msSaveBlob(blob, fn);
        }

        if(self.URL){ // simple fast and modern way using Blob and URL:
            saver(self.URL.createObjectURL(blob), true);
        }else{
            // handle non-Blob()+non-URL browsers:
            if(typeof blob === "string" || blob.constructor===z ){
                try{
                    return saver( "data:" +  m   + ";base64,"  +  self.btoa(blob)  );
                }catch(y){
                    return saver( "data:" +  m   + "," + encodeURIComponent(blob)  );
                }
            }

            // Blob but not URL:
            fr=new FileReader();
            fr.onload=function(e){
                saver(this.result);
            };
            fr.readAsDataURL(blob);
        }
        return true;
    }; /* end download() */
}));


function CanvasSaver(url, dataURI) {
     
    this.url = url;
     
    this.savePNG = function(fname) {
	
        if( !url) return;
        fname = fname || 'who';
        var data = dataURI;
        data = data.substr(data.indexOf(',') + 1).toString();
         
        var dataInput = document.createElement("input") ;
        dataInput.setAttribute("name", 'imgdata') ;
        dataInput.setAttribute("value", data);
        dataInput.setAttribute("type", "hidden");
         
        var nameInput = document.createElement("input") ;
        nameInput.setAttribute("name", 'name') ;
        nameInput.setAttribute("value", fname + '.png');
         
        var myForm = document.createElement("form");
        myForm.method = 'post';
        myForm.action = url;
        myForm.appendChild(dataInput);
        myForm.appendChild(nameInput);
         
        document.body.appendChild(myForm) ;
        myForm.submit() ;
        document.body.removeChild(myForm) ;
         $('div.blockui').unblock();
    };
     
}

// Word wrap for Canvas, for too long text
function wrapText(context, text, x, y, maxWidth, lineHeight) {
        var words = text.split(' ');
        var line = '';

        for(var n = 0; n < words.length; n++) {
          var testLine = line + words[n] + ' ';
          var metrics = context.measureText(testLine);
          var testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
          }
          else {
            line = testLine;
          }
        }
        context.fillText(line, x, y);
      }