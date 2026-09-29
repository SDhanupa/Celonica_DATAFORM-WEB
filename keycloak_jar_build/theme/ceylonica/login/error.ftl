<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false; section>
    <#if section = "header">
        ${msg("errorTitle")}
    <#elseif section = "form">
        <div class="info-content-box">
            <div class="alert-box alert-error" style="margin-bottom: 20px;">
                <span class="alert-text">${message.summary}</span>
            </div>
            <#if client?? && client.baseUrl?has_content>
                <div class="form-action" style="margin-top: 24px;">
                    <a href="${client.baseUrl}" class="btn-emerald" style="text-decoration: none; text-align: center; display: block;">
                        <span>Back to application</span>
                    </a>
                </div>
            </#if>
        </div>
    </#if>
</@layout.registrationLayout>
