<#import "template.ftl" as layout>
<#import "user-profile-commons.ftl" as profileFields>
<@layout.registrationLayout displayMessage=messagesPerField.exists('global'); section>
    <#if section = "header">
        Complete your profile
    <#elseif section = "form">
        <p class="profile-notice">Your NIC helps us distinguish accounts and discourage dummy registrations. Entering it does not verify your identity. It stays private.</p>
        <form id="kc-update-profile-form" class="auth-form" action="${url.loginAction}" method="post">
            <@profileFields.userProfileFormFields/>
            <div class="form-action" style="margin-top:24px">
                <button class="btn-emerald" type="submit">Continue</button>
                <#if isAppInitiatedAction??>
                    <button class="btn-outline-emerald" type="submit" name="cancel-aia" value="true" formnovalidate>${msg("doCancel")}</button>
                </#if>
            </div>
        </form>
    </#if>
</@layout.registrationLayout>
