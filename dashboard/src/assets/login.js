/**
 * Created by root on 17-2-19.
 */
    window.onload=function(){
        'use restrict';

        $("#username").focus(function () {
            $(this).parent().addClass('active');
        })

        $("#username").blur(function () {
            $(this).parent().removeClass('active');
        })

        $("#userpwd").focus(function () {
            $(this).parent().addClass('active');
        })

        $("#userpwd").blur(function () {
            $(this).parent().removeClass('active');
        })

        $("form").submit(function(){
            window.localStorage.setItem("name",$("#username").val());
        })

    }
