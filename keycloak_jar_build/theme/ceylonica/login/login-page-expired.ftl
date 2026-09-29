<#import "template.ftl" as layout>
<@layout.registrationLayout; section>
    <#if section = "header">
        Session Expired
    <#elseif section = "form">
        <div class="info-content-box">
            <p class="form-instruction-text">
                Your login session has expired. Please click below to restart your login.
            </p>
            <div class="form-action" style="margin-top: 24px;">
                <a id="loginRestartLink" href="${url.loginRestartFlowUrl}" class="btn-emerald" style="text-decoration: none; text-align: center; display: block;">
                    <span>Restart Login</span>
                </a>
            </div>
        </div>
    </#if>
</@layout.registrationLayout>
