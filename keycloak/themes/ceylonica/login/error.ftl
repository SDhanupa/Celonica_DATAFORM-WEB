<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false; section>
    <#if section = "header">
        ${msg("errorTitle")}
    <#elseif section = "form">
        <div class="info-content-box">
            <div class="alert-box alert-error" style="margin-bottom: 20px;">
                <span class="alert-text">${message.summary}</span>
            </div>
            <p style="margin-bottom: 20px;">If this page has expired, open login to start a new session.</p>
            <div class="form-action" style="margin-top: 24px;">
                <a href="${properties.applicationLoginUrl}" class="btn-emerald" style="text-decoration: none; text-align: center; display: block;">
                    <span>Go to login</span>
                </a>
            </div>
        </div>
    </#if>
</@layout.registrationLayout>
