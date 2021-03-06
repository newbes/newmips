$(document).ready(function(){

	/* --------------- Gestion des Toastr (messages informatifs en bas à gauche) --------------- */
	toastr.options = {
		"closeButton": false,
		"debug": false,
		"newestOnTop": false,
		"progressBar": true,
		"positionClass": "toast-bottom-left",
		"preventDuplicates": false,
		"onclick": null,
		"showDuration": "300",
		"hideDuration": "1000",
		"timeOut": "5000",
		"extendedTimeOut": "1000",
		"showEasing": "swing",
		"hideEasing": "linear",
		"showMethod": "fadeIn",
		"hideMethod": "fadeOut"
	};
	for (var i = 0; i < toastrArray.length; i++) {
		setTimeout(function(toast){
			switch(toast.level){
				case "info":
				toastr.info(toast.message);
				break;
				case "success":
				toastr.success(toast.message);
				break;
				case "warning":
				toastr.warning(toast.message);
				break;
				case "error":
				toastr.error(toast.message);
				break;
			}
		}(toastrArray[i]), (1000*i));
	}

	/* --------------- Gestion des menus / sidebar --------------- */
	var url = window.location.href;
	var current_url = url.split("/");

	var mainMenu = current_url[3];
	var subMenu = current_url[4];

	var lookingForSource = url.split("&");

	if(typeof lookingForSource[2] !== "undefined"){
		var source = lookingForSource[2].split("=");
	}

	if(typeof source !== "undefined" && source[0] == "associationSource"){
		$("#"+source[1]+"_menu_item").addClass("active");
	}
	else{
		$("#"+mainMenu+"_menu_item").addClass("active");
		$("a[href='/"+mainMenu+"/"+subMenu+"']").css("color", "#3c8dbc");
	}

	/* --------------- Initialisation des iCheck - Checkbox + RadioButton --------------- */
    $("input[type='checkbox'], input[type='radio']").iCheck({
        checkboxClass: 'icheckbox_flat-blue',
        radioClass: 'iradio_flat-blue',
        disabledClass: ''
    });

    /* --------------- Initialisation des CKEDITOR --------------- */
    $("textarea").each(function(){
    	CKEDITOR.replace($(this).attr("id"));
    });

    /* --------------- Initialisation des timepicker --------------- */
    $(".timepicker").timepicker({
		showInputs: false
	});

	/* --------------- Regex on decimal input --------------- */
	$("input[data-custom-type='decimal']").keyup(function(e) {
		var reg = new RegExp("^[0-9]+([\.\,][0-9]*)?$");
		while($(this).val() != "" && !reg.test($(this).val())){
			$(this).val($(this).val().substring(0, $(this).val().length-1))
		}
	});

	/* --------------- Initialisation des DateTimepicker --------------- */
	/* --------------- Initialisation des datepicker --------------- */
	/* --------------- Initialisation des Input Maks --------------- */
	$("input[data-type='email']").inputmask({alias: "email"});

	/* Uncomment if you want to apply a mask on tel input */
	/*$("input[type='tel']").inputmask({mask: "+## # ## ## ## ##"});*/

	if(lang_user == "fr-FR"){
		$('.datepicker').datepicker({
			format: "dd/mm/yyyy",
			language: lang_user,
			autoclose: true,
			clearBtn: true
		});
		// Mask retiré car empeche la modification de la value de FR -> EN avant le submit de la form (code ci-dessous)
		//$(".datepicker").inputmask({"alias": "dd/mm/yyyy"});

		$('.datetimepicker').datetimepicker({
			format: "DD/MM/YYYY HH:mm:ss",
			sideBySide: true
		});
	}
	else{
		$('.datepicker').datepicker({
			format: "yyyy-mm-dd",
			language: lang_user,
			autoclose: true,
			clearBtn: true
		});
		// Mask retiré car empeche la modification de la value de FR -> EN avant le submit de la form (code ci-dessous)
		//$(".datepicker").inputmask({"alias": "yyyy-mm-dd"});

		$('.datetimepicker').datetimepicker({
			format: "YYYY-MM-DD HH:mm:ss",
			sideBySide: true
		});
	}

	/* --------------- Initialisation des date a afficher correctement selon la langue --------------- */
    $('.datepicker').each(function(){
		if($(this).val() != "" && $(this).val() != "Invalid date" && $(this).val() != "Invalid Date"){
			if(lang_user == "fr-FR")
				$(this).val(moment(new Date($(this).val())).format("DD/MM/YYYY"));
			else
				$(this).val(moment(new Date($(this).val())).format("YYYY-MM-DD"));
		}
		else{
			$(this).val("");
		}
	});

	$("td[data-type='date']").each(function(){
		if($(this).html() != "" && $(this).html() != "Invalid date" && $(this).html() != "Invalid Date"){
			if(lang_user == "fr-FR")
				$(this).html(moment(new Date($(this).html())).format("DD/MM/YYYY"));
			else
				$(this).html(moment(new Date($(this).html())).format("YYYY-MM-DD"));
		}
		else{
			$(this).html("");
		}
	});

	$('.datetimepicker').each(function(){
		if($(this).attr("value") != "" && $(this).attr("value") != "Invalid date" && $(this).attr("value") != "Invalid Date"){
			if(lang_user == "fr-FR")
				$(this).val(moment(new Date($(this).attr("value"))).format("DD/MM/YYYY HH:mm:ss")).change();
			else
				$(this).val(moment(new Date($(this).attr("value"))).format("YYYY-MM-DD HH:mm:ss")).change();
		}
		else{
			$(this).val("");
		}
	});

	$("td[data-type='datetime']").each(function(){
		if($(this).html() != "" && $(this).html() != "Invalid date" && $(this).html() != "Invalid Date"){
			if(lang_user == "fr-FR")
				$(this).html(moment(new Date($(this).html())).format("DD/MM/YYYY HH:mm:ss"));
			else
				$(this).html(moment(new Date($(this).html())).format("YYYY-MM-DD HH:mm:ss"));
		}
		else{
			$(this).html("");
		}
	});

	$('td[data-type="boolean"]').each(function() {
		var val = $(this).html();
		if (val == 'true' || val == '1')
			$(this).html('<i class="fa fa-check-square-o fa-lg"></i>"');
		else
			$(this).html('<i class="fa fa-square-o fa-lg"></i>"');
	});

	/* 1er Tentative */
	/* Decimal input, remove . and insert a , */
	/* Doesn't work at all */
	/*$("input[type='number'][step='any']").each(function(){
		$(this).keydown(function(e) {
			if(e.key == "."){
				e.key = ",";
			}*/
			/*var value = $(this).val();
			var newValue = value.replace(".", ",");
			$(this).val(newValue);*/
		/*});
	});*/

	/* 2ème Tentative */
	/* Decimal input, remove . and insert a , */
	/* Doesn't work at all */
	/*var inputDecimalValues = {};
	$("input[type='number'][step='any']").each(function(){
		$(this).keypress(function(e) {
			var nameObj = $(this).attr("name");

			if($(this).val() == ""){
				console.log("1");
				if(typeof inputDecimalValues[nameObj] !== "undefined"){
					console.log("11");
					var newValue = "";
					if(inputDecimalValues[nameObj].match(",.+") != null){
						console.log("12");
						newValue = inputDecimalValues[nameObj] + e.key;
						inputDecimalValues[nameObj] = newValue;
						console.log(newValue);
						$(this).val(newValue);
					}
					else{
						if(inputDecimalValues[nameObj].indexOf(",") == -1){
							console.log("13");
							inputDecimalValues[nameObj] = inputDecimalValues[nameObj] + ".";
						}
						else{
							console.log("14");
							inputDecimalValues[nameObj] = inputDecimalValues[nameObj] + e.key;
						}
					}
				}
			}
			else{
				console.log("2");
				inputDecimalValues[nameObj] = $(this).val();
			}

			console.log("FIN");
			console.log(inputDecimalValues);
		});
	});*/

	/* Avoid .dropzone to be automaticaly initialized */
	Dropzone.autoDiscover = false;

	/* --------------- Initialisation de DROPZONE JS - COMPONENT --------------- */

	var dropzonesComponentArray = [];

	/* File Storage Component */
	$('.dropzone_local_file_component').each(function(index){
		var that = $(this);
	    var dropzoneInit = new Dropzone("#"+$(this).attr("id"), {
	        url: "/"+that.attr("data-component")+"/file_upload",
	        autoProcessQueue: false,
	        maxFilesize: 10,
			addRemoveLinks: true,
			uploadMultiple: false,
	        dictDefaultMessage: "Glisser le fichier ou cliquer ici pour ajouter.",
			dictRemoveFile: "Supprimer",
			dictCancelUpload: "Annuler",
			init: function() {
				this.on("addedfile", function() {
					if (this.files[1]!=null){
						this.removeFile(this.files[1]);
						toastr.error("Vous ne pouvez ajouter qu'un seul fichier");
					}else{
						$("#"+that.attr("id")+"_hidden").val(this.files[0].name);
					}
				});
				this.on("sending", function(file, xhr, formData) {
					var storageType = that.attr("data-storage");
					var dataComponent = that.attr("data-component");
					var dataSource = that.attr("data-source");
					var dataSourceID = that.attr("data-sourceId");
					formData.append("storageType", storageType);
					formData.append("dataComponent", dataComponent);
					formData.append("dataSource", dataSource);
					formData.append("dataSourceID", dataSourceID);
				});
				this.on("maxfilesexceeded", function(){
					this.removeFile(this.files[1]);
					toastr.error("Vous ne pouvez ajouter qu'un seul fichier");
				});
				this.on("error", function(file, message){
					this.removeFile(this.files[0]);
					toastr.error(message);
					$("#"+that.attr("id")+"_hidden").removeAttr('value');
				});
			}
	    });

	    dropzonesComponentArray[$(this).attr("data-component")] = [];
	    dropzonesComponentArray[$(this).attr("data-component")].push(dropzoneInit);
	});

	/* Dropzone files managment already done ? */
	var filesComponentProceeded = false;

    /* Proceed dropzone before submit the component form */
    $(document).on("submit", ".component-form", function(e) {
		if(!filesComponentProceeded && dropzonesComponentArray[$(this).attr("data-component")].length > 0){
			/* If there are files to write, stop submit and do this before */
			e.preventDefault();

			/* Send dropzone file */
			for(var i=0; i<dropzonesComponentArray[$(this).attr("data-component")].length; i++){
				if(dropzonesComponentArray[$(this).attr("data-component")][i].files.length > 0){
					dropzonesComponentArray[$(this).attr("data-component")][i].processQueue();
					(function(ibis, myform){
						dropzonesComponentArray[myform.attr("data-component")][i].on("complete", function(file) {
							if(ibis == dropzonesComponentArray[myform.attr("data-component")].length - 1){
								filesComponentProceeded = true;
								myform.submit();
							}
						});
					})(i, $(this))
				}
				else{
					if(i == dropzonesComponentArray[$(this).attr("data-component")].length - 1){
						filesComponentProceeded = false;
						toastr.error("You should add a file.");
					}
				}
			}
		}

		return true;
	});

	/* --------------- Initialisation de DROPZONE JS - FIELD --------------- */
    var dropzonesFieldArray = [];

	$('.dropzone-field').each(function(index){
		var that = $(this);
	    var dropzoneInit = new Dropzone("#"+$(this).attr("id"), {
	        url: "/default/file_upload",
	        autoProcessQueue: false,
	        maxFilesize: 10,
			addRemoveLinks: true,
			uploadMultiple: false,
	        dictDefaultMessage: "Glisser le fichier ou cliquer ici pour ajouter.",
			dictRemoveFile: "Supprimer",
			dictCancelUpload: "Annuler",
			init: function() {
				this.on("addedfile", function() {
					if (this.files[1]!=null){
						this.removeFile(this.files[1]);
						toastr.error("Vous ne pouvez ajouter qu'un seul fichier");
					}else{
						$("#"+that.attr("id")+"_hidden").val(this.files[0].name);
					}
				});
				this.on("sending", function(file, xhr, formData) {
					var storageType = that.attr("data-storage");
					var dataEntity = that.attr("data-entity");
					formData.append("storageType", storageType);
					formData.append("dataEntity", dataEntity);
				});
				this.on("maxfilesexceeded", function(){
					this.removeFile(this.files[1]);
					toastr.error("Vous ne pouvez ajouter qu'un seul fichier");
				});
				this.on("error", function(file, message){
					this.removeFile(this.files[0]);
					toastr.error(message);
					$("#"+that.attr("id")+"_hidden").removeAttr('value');
				});
			}
	    });

	    dropzonesFieldArray.push(dropzoneInit);
	});

	/* Dropzone files managment already done ? */
	var filesProceeded = false;

	$(document).on("submit", "form", function(e) {

		if(!filesProceeded && dropzonesFieldArray.length > 0){
			/* If there are files to write, stop submit and do this before */
			e.preventDefault();

			/* Send dropzone file */
			for(var i=0; i<dropzonesFieldArray.length; i++){
				if(dropzonesFieldArray[i].files.length > 0){
					dropzonesFieldArray[i].processQueue();
					(function(ibis, myform){
						dropzonesFieldArray[i].on("complete", function(file) {
							if(ibis == dropzonesFieldArray.length - 1){
								filesProceeded = true;
								myform.submit();
							}
						});
					})(i, $(this))
				}
				else{
					if(i == dropzonesFieldArray.length - 1){
						filesProceeded = true;
						$(this).submit();
					}
				}
			}
		}

		/* On converti les dates francaises en date yyyy-mm-dd pour la BDD */
		if(lang_user == "fr-FR"){
			/* Datepicker FR convert*/
			$(this).find('.datepicker').each(function() {
				if($(this).val().length > 0){
					// Sécurité
					$(this).prop("readOnly", true);

					var date = $(this).val().split("/");
					var newDate = date[2] + "-" + date[1] + "-" + date[0];
					$(this).val(newDate);
				}
			});

			/* Datetimepicer FR convert */
			$(this).find('.datetimepicker').each(function() {
				if($(this).val().length > 0){
					// Sécurité
					$(this).prop("readOnly", true);

					var date = $(this).val().split("/");
					var yearDate = date[2].split(" ");
					var newDate = yearDate[0] + "-" + date[1] + "-" + date[0] + " " + yearDate[1];
					$(this).val(newDate);
				}
			});
		}

		/* Converti les checkbox "on" en value boolean true/false pour insertion en BDD */
		$(this).find("input[type='checkbox']").each(function(){
			if($(this).prop("checked")){
				$(this).val(true);
			}
			else{
				/* Coche la checkbox afin qu'elle soit prise en compte dans le req.body */
				$(this).prop("checked", true);
				$(this).val(false);
			}
		});

		/* Vérification que les input mask EMAIL sont bien complétés jusqu'au bout */
		$(this).find("input[data-type='email']").each(function(){
			if ($(this).val().length > 0 && !$(this).inputmask("isComplete")){
				$(this).css("border", "1px solid red").parent().after("<span style='color: red;'>Le champ est incomplet.</span>");
				e.preventDefault();
				return false;
			}
		});
		/* Vérification que les input mask TEL sont bien complétés jusqu'au bout */
		$(this).find("input[type='tel']").each(function(){
			if ($(this).val().length > 0 && !$(this).inputmask("isComplete")){
				$(this).css("border", "1px solid red").parent().after("<span style='color: red;'>Le champ est incomplet.</span>");
				e.preventDefault();
				return false;
			}
		});

		return true;
	});

	/* --------------- Initialisation des select --------------- */
	$("select").select2();
});