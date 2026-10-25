<#import "template.ftl" as layout>
<#import "user-profile-commons.ftl" as profileFields>
<@layout.registrationLayout bodyClass="profile-page" displaySocial=false displayMessage=messagesPerField.exists('global'); section>
    <#if section = "header">
        Complete your profile
    <#elseif section = "form">
        <p class="profile-notice">Confirm your details to finish signing up. Fields marked * are required.</p>
        <form id="kc-update-profile-form" class="auth-form" action="${url.loginAction}" method="post">
            <@profileFields.userProfileFormFields/>
            <p class="profile-help">Your NIC stays private. It helps distinguish accounts; entering it alone does not verify your identity.</p>
            <div class="form-action">
                <button class="btn-emerald" type="submit">Continue</button>
                <#if isAppInitiatedAction??>
                    <button class="btn-outline-emerald" type="submit" name="cancel-aia" value="true" formnovalidate>${msg("doCancel")}</button>
                </#if>
            </div>
        </form>
    </#if>
</@layout.registrationLayout>
