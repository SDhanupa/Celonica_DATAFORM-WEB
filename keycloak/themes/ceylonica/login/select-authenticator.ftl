<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=false; section>
    <#if section = "header">
        Select login method
    <#elseif section = "form">

        <form id="kc-select-credential-form" action="${url.loginAction}" method="post" class="auth-form" style="margin-top: 10px;">
            
            <p style="color: #6C757D; text-align: center; margin-bottom: 25px; font-size: 14px;">
                Please choose how you would like to sign in to your account.
            </p>

            <div class="authenticator-list" style="display: flex; flex-direction: column; gap: 15px;">
                <#list auth.authenticationSelections as selection>
                    <button class="authenticator-card" type="submit" name="authenticationExecution" value="${selection.authExecId}">
                        <div class="auth-icon-container">
                            <#if selection.authExecId?contains("password")>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="auth-icon"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            <#else>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="auth-icon"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                            </#if>
                        </div>
                        <div class="auth-text-container">
                            <h4 class="auth-title">${msg(selection.displayName)}</h4>
                            <p class="auth-desc">${msg(selection.helpText)}</p>
                        </div>
                        <div class="auth-arrow">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        </div>
                    </button>
                </#list>
            </div>

        </form>

        <style>
            .authenticator-card {
                background: #FFFFFF;
                border: 1px solid #E2E8F0;
                border-radius: 12px;
                padding: 16px;
                display: flex;
                align-items: center;
                gap: 16px;
                width: 100%;
                text-align: left;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 2px 4px rgba(0,0,0,0.02);
            }
            .authenticator-card:hover {
                border-color: #2D5A27;
                box-shadow: 0 4px 12px rgba(45, 90, 39, 0.1);
                transform: translateY(-2px);
            }
            .auth-icon-container {
                background: #F1F5F9;
                color: #2D5A27;
                padding: 12px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .authenticator-card:hover .auth-icon-container {
                background: #E8F3E8;
            }
            .auth-text-container {
                flex-grow: 1;
            }
            .auth-title {
                margin: 0 0 4px 0;
                font-size: 16px;
                font-weight: 600;
                color: #1E293B;
            }
            .auth-desc {
                margin: 0;
                font-size: 13px;
                color: #64748B;
                line-height: 1.4;
            }
            .auth-arrow {
                color: #CBD5E1;
                transition: transform 0.2s ease;
            }
            .authenticator-card:hover .auth-arrow {
                color: #2D5A27;
                transform: translateX(4px);
            }
        </style>

    </#if>
</@layout.registrationLayout>
