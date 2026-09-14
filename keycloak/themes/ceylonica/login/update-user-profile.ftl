<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','email','firstName','lastName','nic','mobile_number'); section>
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
            <#assign nicVal = "">
            <#if profile?? && profile.attributesByName('nic')??>
                <#assign nicVal = profile.attributesByName('nic').value!''>
            <#elseif user?? && user.attributes?? && user.attributes.nic??>
                <#if user.attributes.nic?is_sequence>
                    <#if user.attributes.nic?size \> 0><#assign nicVal = user.attributes.nic[0]></#if>
                <#else>
                    <#assign nicVal = user.attributes.nic>
                </#if>
            </#if>
            <div class="form-group <#if messagesPerField.existsError('nic')>has-error</#if>">
                <label for="nic" class="input-label">National Identity Card (NIC)</label>
                <div class="input-wrapper">
                    <input type="text" id="nic" name="nic" class="pill-input" value="${nicVal}" readonly="readonly" style="background-color: #f3f4f6; color: #6b7280; cursor: not-allowed; pointer-events: none;" />
                </div>
                <#if messagesPerField.existsError('nic')>
                    <span class="field-error-text">${kcSanitize(messagesPerField.get('nic'))?no_esc}</span>
                </#if>
            </div>

            <#assign mobileVal = "">
            <#if profile?? && profile.attributesByName('mobile_number')??>
                <#assign mobileVal = profile.attributesByName('mobile_number').value!''>
            <#elseif user?? && user.attributes?? && user.attributes.mobile_number??>
                <#if user.attributes.mobile_number?is_sequence>
                    <#if user.attributes.mobile_number?size \> 0><#assign mobileVal = user.attributes.mobile_number[0]></#if>
                <#else>
                    <#assign mobileVal = user.attributes.mobile_number>
                </#if>
            </#if>
            <div class="form-group <#if messagesPerField.existsError('mobile_number')>has-error</#if>">
                <label for="mobile_number" class="input-label">Mobile Number</label>
                <div class="input-wrapper">
                    <input type="text" id="mobile_number" name="mobile_number" class="pill-input" value="${mobileVal}" readonly="readonly" style="background-color: #f3f4f6; color: #6b7280; cursor: not-allowed; pointer-events: none;" />
                </div>
                <#if messagesPerField.existsError('mobile_number')>
                    <span class="field-error-text">${kcSanitize(messagesPerField.get('mobile_number'))?no_esc}</span>
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
