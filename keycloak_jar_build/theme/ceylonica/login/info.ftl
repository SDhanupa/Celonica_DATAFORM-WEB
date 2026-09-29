<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false; section>
    <#if section = "header">
        <#if messageHeader??>
            ${messageHeader}
        <#else>
            ${message.summary}
        </#if>
    <#elseif section = "form">
        <div class="info-content-box">
            <p class="form-instruction-text">
                ${message.summary}
                <#if (message.type = 'success' && (actionUri?? || client.baseUrl??))>
                    <#if actionUri??>
                        <p><a href="${actionUri}" class="signup-link">${msg("proceedWithAction")}</a></p>
                    <#elseif client?? && client.baseUrl??>
                        <p><a href="${client.baseUrl}" class="signup-link">${msg("backToApplication")}</a></p>
                    </#if>
                </#if>
            </p>
            <#if skipLink??>
            <#else>
                <#if pageRedirectUri??>
                    <div class="form-action" style="margin-top: 24px;">
                        <a href="${pageRedirectUri}" class="btn-emerald" style="text-decoration: none; text-align: center; display: block;">
                            <span>${msg("backToApplication")}</span>
                        </a>
                    </div>
                <#elseif actionUri??>
                    <div class="form-action" style="margin-top: 24px;">
                        <a href="${actionUri}" class="btn-emerald" style="text-decoration: none; text-align: center; display: block;">
                            <span>${msg("proceedWithAction")}</span>
                        </a>
                    </div>
                <#elseif client?? && client.baseUrl?has_content>
                    <div class="form-action" style="margin-top: 24px;">
                        <a href="${client.baseUrl}" class="btn-emerald" style="text-decoration: none; text-align: center; display: block;">
                            <span>${msg("backToApplication")}</span>
                        </a>
                    </div>
                </#if>
            </#if>
        </div>
    </#if>
</@layout.registrationLayout>
