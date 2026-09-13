<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=true displayMessage=!messagesPerField.existsError('otp'); section>
    <#if section = "header">
        Verify Mobile Number
    <#elseif section = "form">
        <div id="kc-form">
            <div id="kc-form-wrapper">
                <form id="kc-sms-otp-login-form" action="${url.loginAction}" method="post" class="auth-form">
                    
                    <div style="margin-bottom: 24px; color: #4b5563; font-size: 14px; text-align: center;">
                        We have sent an 8-digit secure code to <strong>${(mobile_number!'your phone')}</strong>.
                    </div>

                    <div class="form-group <#if messagesPerField.existsError('otp')>has-error</#if>">
                        <label for="otp" class="input-label">Enter OTP</label>
                        <div class="input-wrapper">
                            <input tabindex="1" id="otp" class="pill-input" name="otp" type="text" autofocus autocomplete="off"
                                maxlength="8"
                                aria-invalid="<#if messagesPerField.existsError('otp')>true</#if>"
                                placeholder="8-digit code" />
                        </div>
                        <#if messagesPerField.existsError('otp')>
                            <span class="field-error-text" aria-live="polite">
                                ${kcSanitize(messagesPerField.get('otp'))?no_esc}
                            </span>
                        </#if>
                    </div>

                    <div class="form-action" style="margin-top: 32px;">
                        <button tabindex="2" class="btn-emerald" name="login" id="kc-login" type="submit">
                            <span>Verify Code</span>
                        </button>
                    </div>

                </form>
            </div>
        </div>
    <#elseif section = "info">
        <div class="auth-aux-links">
            <div class="forgot-link-box">
                <form id="kc-sms-resend-form" action="${url.loginAction}" method="post" style="display:inline;">
                    <!-- By submitting without an 'otp' field, we can trigger the rate limit logic or resend if we handle it in Java -->
                    <span style="color: #6b7280; font-size: 13px;">Didn't receive the code? </span>
                    <button type="submit" class="forgot-password-link" style="background:none; border:none; padding:0; font-weight:600; cursor:pointer;">
                        Resend OTP
                    </button>
                </form>
            </div>
            <div class="register-prompt" style="margin-top: 12px;">
                <a tabindex="3" id="reset-login" href="${url.loginRestartFlowUrl}" class="signup-link">Back to Login</a>
            </div>
        </div>
    </#if>
</@layout.registrationLayout>
