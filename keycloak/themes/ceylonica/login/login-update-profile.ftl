<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','email','firstName','lastName','user.attributes.nic','user.attributes.mobile_number'); section>
    <#if section = "header">
        ${msg("loginProfileTitle")}
    <#elseif section = "form">
        <form id="kc-update-profile-form" class="auth-form" action="${url.loginAction}" method="post">
            <#if user.editUsernameAllowed>
                <div class="form-group <#if messagesPerField.existsError('username')>has-error</#if>">
                    <label for="username" class="input-label">${msg("username")}</label>
                    <div class="input-wrapper">
                        <input type="text" id="username" name="username" class="pill-input" value="${(user.username!'')}" autofocus />
                    </div>
                    <#if messagesPerField.existsError('username')>
                        <span class="field-error-text">${kcSanitize(messagesPerField.get('username'))?no_esc}</span>
                    </#if>
                </div>
            </#if>

            <div class="form-group <#if messagesPerField.existsError('email')>has-error</#if>">
                <label for="email" class="input-label">${msg("email")}</label>
                <div class="input-wrapper">
                    <input type="email" id="email" name="email" class="pill-input" value="${(user.email!'')}" />
                </div>
                <#if messagesPerField.existsError('email')>
                    <span class="field-error-text">${kcSanitize(messagesPerField.get('email'))?no_esc}</span>
                </#if>
            </div>

            <div class="form-row-2col">
                <div class="form-group <#if messagesPerField.existsError('firstName')>has-error</#if>">
                    <label for="firstName" class="input-label">${msg("firstName")}</label>
                    <div class="input-wrapper">
                        <input type="text" id="firstName" name="firstName" class="pill-input" value="${(user.firstName!'')}" />
                    </div>
                    <#if messagesPerField.existsError('firstName')>
                        <span class="field-error-text">${kcSanitize(messagesPerField.get('firstName'))?no_esc}</span>
                    </#if>
                </div>

                <div class="form-group <#if messagesPerField.existsError('lastName')>has-error</#if>">
                    <label for="lastName" class="input-label">${msg("lastName")}</label>
                    <div class="input-wrapper">
                        <input type="text" id="lastName" name="lastName" class="pill-input" value="${(user.lastName!'')}" />
                    </div>
                    <#if messagesPerField.existsError('lastName')>
                        <span class="field-error-text">${kcSanitize(messagesPerField.get('lastName'))?no_esc}</span>
                    </#if>
                </div>
            </div>

            <#-- Assuming the user attributes are declared in Keycloak declarative user profile -->
            <div class="form-group <#if messagesPerField.existsError('user.attributes.nic')>has-error</#if>">
                <label for="user.attributes.nic" class="input-label">National Identity Card (NIC)</label>
                <div class="input-wrapper">
                    <input type="text" id="user.attributes.nic" name="user.attributes.nic" class="pill-input" value="${(user.attributes.nic!'')}" />
                </div>
                <#if messagesPerField.existsError('user.attributes.nic')>
                    <span class="field-error-text">${kcSanitize(messagesPerField.get('user.attributes.nic'))?no_esc}</span>
                </#if>
            </div>

            <div class="form-group <#if messagesPerField.existsError('user.attributes.mobile_number')>has-error</#if>">
                <label for="user.attributes.mobile_number" class="input-label">Mobile Number</label>
                <div class="input-wrapper">
                    <input type="text" id="user.attributes.mobile_number" name="user.attributes.mobile_number" class="pill-input" value="${(user.attributes.mobile_number!'')}" />
                </div>
                <#if messagesPerField.existsError('user.attributes.mobile_number')>
                    <span class="field-error-text">${kcSanitize(messagesPerField.get('user.attributes.mobile_number'))?no_esc}</span>
                </#if>
            </div>

            <div class="form-action" style="margin-top:24px;">
                <#if isAppInitiatedAction??>
                    <button class="btn-outline-emerald" type="submit" name="cancel-aia" value="true" style="margin-right:8px;">${msg("doCancel")}</button>
                </#if>
                <button class="btn-emerald" type="submit">
                    <span>${msg("doSubmit")}</span>
                </button>
            </div>
        </form>
    </#if>
</@layout.registrationLayout>
