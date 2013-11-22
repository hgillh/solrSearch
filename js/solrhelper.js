var SOLR_BASE= "ENTER_YOUR_SOLR_URL_HERE";
var RESULTS_PER_PAGE= 20;
var START=20;
var Last_query;


function on_product_data(data) {        
        var docs = data.response.docs;
        var total = 'Found ' + data.response.numFound + ' results for your query.';
        $("#status").text(total);  
        
        if(data.response.numFound > 0)
        {
        	AppendProducts(docs);
        	if( data.response.numFound > RESULTS_PER_PAGE )
	        {
	        	$(".more_btn").show();
	        	$(".more_btn").val("Load More Results");
	        }
        }
    }

function AppendProducts(docs)
{
	$.each(docs, function(i, item) {		
			
			var pro = "<div class='product'>"
			pro+= "<div class='product_image'>"
			pro+= "<img src='" + item.image  +"' height='95' width='95' />"
			pro+= "</div>"
			pro+= "<div class='product_details'>"
			pro+=  "<b>Title : </b>" + item.title +"<br/>"
			pro+=  "<b>SKU : </b>" + item.sku +"<br/>"
			pro+=  "<b>Category : </b>" + item.cat1 +"<br/>"
			pro+= "</div>"
			pro+= "</div>"
            $('#results').append(pro);
        }); 
}
function EncodeQuery(str){
     return encodeURIComponent(str).replace(/[!'()]/g, escape).replace(/\*/g, "%2A");
}
function on_search() {		
        var query = $('#query').val();
        if (query.length == 0) {
            alert("Please enter a search term.")
            return;
        } 
        $(".more_btn").hide();
        $('#results').empty();
		$("#status").text("Searching .............");
		START = 0;
        var search_terms =  $("#query").val().trim();        
        var q = "(title:" + search_terms + ") OR (description: " + search_terms + ") OR (sku:" + search_terms + ")";
        q =  EncodeQuery(q);   
        var query= SOLR_BASE + "/select?q=" + q +"&wt=json&fl=title,sku,image,cat1&callback=?&json.wrf=on_product_data&rows="+ RESULTS_PER_PAGE;
        Last_query = query;
        query = query + "&start=" + START; 
        $.getJSON(query);
    }
function LoadNext()
{
	$(".more_btn").show();
    $(".more_btn").val("Loading .......");
	START +=RESULTS_PER_PAGE;
    query = Last_query + "&start=" + START; 
    $.getJSON(query);
    
    return false;
}

function LoadDropShipperAutoComplete()
{
	
    var query= SOLR_BASE + "/select?q=*%3A*&facet.field=dropshipper_name&facet=on&wt=json&callback=?&json.wrf=on_dropshipper_data&rows=0";   	
    $.getJSON(query);
}
function getCatsByDropShipper(dropshipper) {
  $("#cat_status").show();
  
  q = "dropshipper_name:" + dropshipper;
  q =  EncodeQuery(q); 
  
  var query= SOLR_BASE + "/select?q=" + q +"&wt=json&fl=cat1&facet=on&facet.field=cat1&callback=?&json.wrf=on_cats_data&rows=0";   	
  $.getJSON(query);
  
}
function on_cats_data(data) {
  	var docs = data.facet_counts.facet_fields.cat1;
	
	$("#cat_status").hide();
	for(var i=0; i<= docs.length-1; i=i+2)
	{
		
		var cat = "<a class='cat_link' onclick='LoadCatProducts(this)' data='" + docs[i] +"' href='#'>" + docs[i] +"</a><br/>"
		$("#cats").append(cat);
	}
}

function LoadCatProducts(obj) {
	
	$(".more_btn").hide();
    $('#results').empty();
	$("#status").text("Searching .............");
	START = 0;
    var search_terms =  $(obj).attr('data') ;       
    var q = 'cat1:"' + search_terms +'"';
    q =  EncodeQuery(q);   
    
    var query= SOLR_BASE + "/select?q=" + q +"&wt=json&fl=title,sku,image,cat1&callback=?&json.wrf=on_product_data&rows="+ RESULTS_PER_PAGE;
    Last_query = query;
    query = query + "&start=" + START; 
    
    $.getJSON(query);
    
    return false;
  
}

function on_dropshipper_data(data)
{	
	
	var docs = data.facet_counts.facet_fields.dropshipper_name;
	
	var ds_arr = new Array();
	for(var i=0; i<= docs.length-1; i=i+2)
	{
		ds_arr.push(docs[i]);
	}
	
	
	$( "#dropshiper" ).autocomplete({
      source: ds_arr,
      select: function (event, ui){
      	obj1 = getCatsByDropShipper(ui.item.label);
      	
      },
    });
}

function on_ready() {
        $('#search').click(on_search);        
        LoadDropShipperAutoComplete();
    }




$(document).ready(on_ready);