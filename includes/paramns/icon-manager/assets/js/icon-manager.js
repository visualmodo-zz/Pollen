(function ($) {
    "use strict";
    $.pollenTrigger = $.pollenTrigger || {};
    $.pollenTrigger.wp_media = $.pollenTrigger.wp_media || [];
    $.pollenTrigger.media_new = function () {
        var $body = $("body");
        $body.on('click', '.pollen-upload-icon', $.pollenTrigger.media_new_activate);
    };
    //intended for zip files only. if needed should be easy to expand in the future
    $.pollenTrigger.media_new_activate = function (event) {
        event.preventDefault();
        var clicked = $(this), options = clicked.data();
        options.input_target = $('#' + options.target);
        // Create the media frame.
        var file_frame = wp.media(
            {
                frame: options.frame,
                library: {type: options.type},
                button: {text: options.button},
                className: options['class']
            });
        file_frame.on('select update insert', function () {
            $.pollenTrigger.media_new_insert(file_frame, options);
        });
        //open the media frame
        file_frame.open();
    };
    //insert the url of the zip file
    $.pollenTrigger.media_new_insert = function (file_frame, options) {
        var state = file_frame.state(), selection = state.get('selection').first().toJSON();
        options.input_target.val(selection.id).trigger('change');
        $("body").trigger(options.trigger, [selection, options]);
    };
    $(document).ready(function () {
        $.pollenTrigger.media_new();
        //Fonts Zip file upload
        $("body").on('pollen_insert_zip', $.pollenTrigger.icon_insert);
        //font manager
        $("body").on('click', '.pollen_del_icon', $.pollenTrigger.icon_remove);
    });
    /************************************************************************
     EXTRA FUNCTIONS, NOT NECESSARY FOR THE DEFAULT UPLOAD
     *************************************************************************/
    $.pollenTrigger.icon_insert = function (event, selection, options) {
        // clean the options field, we dont need to save a value
        options.input_target.val("");
        var manager = $('.pollen_iconfont_manager');
        var msg = $('#msg');
        if (selection.subtype !== 'zip') {
            $('.spinner').hide();
            msg.html("<div class='error'><p>Please upload a valid ZIP file.<br/>You can create the file on icomoon.io</p></div>");
            msg.show();
            setTimeout(function () {
                msg.slideUp();
            }, 5000);
            return;
        }
        // send request to server to extract the zip file, re arrange the content and save a config file
        $.ajax({
            type: "POST",
            url: ajaxurl,
            data: {
                action: 'pollen_ajax_add_zipped_font',
                values: selection,
            },
            beforeSend: function () {
                $('.spinner').css({
                    opacity: 0,
                    display: "block",
                    visibility: 'visible',
                    position: 'absolute',
                    top: '21px',
                    left: '345px'
                }).animate({opacity: 1});
            },
            /*error: function()
             {
             alert('Couldn\'t add the font because the server didn’t respond.<br/>Please reload the page, then try again');
             },*/
            success: function (response) {
                $('.spinner').hide();
                if (response.match(/pollen_font_added/)) {
                    msg.html("<div class='updated'><p>Icon Pack added successfully. Reloading the page.</p></div>");
                    msg.show();
                    setTimeout(function () {
                        msg.slideUp();
                        location.reload();
                    }, 5000);
                }
                else {
                    msg.html("<div class='error'><p>Couldn't add the Icon Pack.<br/>The script returned the following error: " + response + "</p></div>");
                    msg.show();
                    setTimeout(function () {
                        msg.slideUp();
                    }, 5000);
                }
                if (typeof console !== 'undefined') console.log(response);
                //msg.fadeOut('slow');
            }
        });
    };
    $.pollenTrigger.icon_remove = function (event) {
        event.preventDefault();
        var button = $(this),
            parent = button.parents('.pollen-available-font:eq(0)'),
            manager = button.parents('.pollen_iconfont_manager:eq(0)'),
            all_fonts = manager.find('.pollen-available-font'),
            del_font = button.data('delete');
        //alert(del_font);
        var msg = $('#msg');
        // send request to server to remove the folder and the database entry
        $.ajax({
            type: "POST",
            url: ajaxurl,
            data: {
                action: 'pollen_ajax_remove_zipped_font',
                del_font: del_font,
            },
            beforeSend: function () {
                $('.spinner').css({
                    opacity: 0,
                    display: "block",
                    visibility: 'visible',
                    position: 'absolute',
                    top: '21px',
                    left: '345px'
                }).animate({opacity: 1});
            },
            error: function () {
                $('.spinner').hide();
                msg.html("<div class='error'><p>Couldn't remove the font because the server didn’t respond.<br/>Please reload the page, then try again</p></div>");
                msg.show();
                setTimeout(function () {
                    msg.slideUp();
                }, 5000);
            },
            success: function (response) {
                $('.spinner').hide();
                if (response.match(/pollen_font_removed/)) {
                    msg.html("<div class='updated'><p>Icon Pack deleted successfully! Reloading the page...</p></div>");
                    msg.show();
                    setTimeout(function () {
                        msg.slideUp();
                        location.reload();
                    }, 5000);
                }
                else {
                    msg.html("<p><div class='error'><p>Couldn't remove the font.<br/>Reloading the page...</p></div>");
                    msg.show();
                    setTimeout(function () {
                        msg.slideUp();
                        location.reload();
                    }, 5000);
                }
                if (typeof console !== 'undefined') console.log(response);
                //msg.fadeOut('slow');
            },
            complete: function (response) {
                //alert(response);
            }
        });
    };
})(jQuery);