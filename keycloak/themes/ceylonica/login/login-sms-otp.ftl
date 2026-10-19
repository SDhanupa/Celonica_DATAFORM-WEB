<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=true displayMessage=!messagesPerField.existsError('otp'); section>
    <#if section = "header">
        Verify Mobile Number
    <#elseif section = "form">
        <div id="kc-form">
            <div id="kc-form-wrapper">
                <form id="kc-sms-otp-login-form" action="${url.loginAction}" method="post" class="auth-form">

                    <div role="status" style="margin-bottom: 24px; color: #315647; font-size: 14px; text-align: center; line-height: 1.6;">
                        <#if message?has_content && message.type == 'error'>
                            Check the message above or request another code.
                        <#else>
                            <strong>Verification code sent</strong><br/>
                            An 8-digit code was sent to <strong>${(mobile_number!'your phone')}</strong>.
                        </#if>
                    </div>

                    <div class="form-group <#if messagesPerField.existsError('otp')>has-error</#if>">
                        <label for="otp" class="input-label">Enter 8-digit OTP</label>
                        <div class="input-wrapper">
                            <input tabindex="1" id="otp" class="pill-input" name="otp" type="text" autofocus autocomplete="off"
                                maxlength="8"
                                aria-invalid="<#if messagesPerField.existsError('otp')>true</#if>"
                                placeholder="00000000" />
                        </div>
                        <#if messagesPerField.existsError('otp')>
                            <span class="field-error-text" aria-live="polite">
                                ${kcSanitize(messagesPerField.get('otp'))?no_esc}
                            </span>
                        </#if>
                    </div>

                    <div class="form-action" style="margin-top: 32px;">
                        <button tabindex="2" class="btn-emerald" name="login" id="kc-login" type="submit">
                            <span>Verify &amp; Sign In</span>
                        </button>
                    </div>

                </form>

                <#-- "Try another way" link to switch to Password login -->
                <#if auth?has_content && auth.showTryAnotherWayLink()>
                    <div style="margin-top: 20px; text-align: center;">
                        <form id="kc-try-another-way-form" action="${url.loginAction}" method="post">
                            <input type="hidden" name="tryAnotherWay" value="on"/>
                            <button type="submit"
                                style="background:none; border:none; padding:0; color:#059669; font-size:14px; font-weight:600; cursor:pointer; text-decoration:underline;">
                                🔑 Try another way / Login via Password
                            </button>
                        </form>
                        <p id="password-switch-error" role="alert" hidden style="color:#a12d2d; font-size:13px; margin-top:10px;">Could not switch to password. Please try again.</p>
                        <script>
                            (function () {
                                const form = document.getElementById('kc-try-another-way-form');
                                form.addEventListener('submit', async function (event) {
                                    event.preventDefault();
                                    const button = form.querySelector('button');
                                    button.disabled = true;
                                    try {
                                        const response = await fetch(form.action, { method: 'POST', credentials: 'same-origin', body: new URLSearchParams(new FormData(form)) });
                                        if (!response.ok) throw new Error('Unable to switch');
                                        const page = new DOMParser().parseFromString(await response.text(), 'text/html');
                                        const selector = page.getElementById('kc-select-credential-form');
                                        const password = selector && selector.querySelector('[data-auth-method="password"]');
                                        if (!password) throw new Error('Password option unavailable');
                                        sessionStorage.setItem('ceylonica-open-password', '1');
                                        const next = document.createElement('form');
                                        next.method = 'post';
                                        next.action = new URL(selector.getAttribute('action'), response.url).href;
                                        const execution = document.createElement('input');
                                        execution.type = 'hidden'; execution.name = 'authenticationExecution'; execution.value = password.value;
                                        next.appendChild(execution); document.body.appendChild(next); next.submit();
                                    } catch (error) {
                                        button.disabled = false;
                                        document.getElementById('password-switch-error').hidden = false;
                                    }
                                });
                            })();
                        </script>
                    </div>
                </#if>
            </div>
        </div>
    <#elseif section = "info">
        <div class="auth-aux-links">
            <div class="forgot-link-box">
                <form id="kc-sms-resend-form" action="${url.loginAction}" method="post" style="display:inline;">
                    <span style="color: #6b7280; font-size: 13px;">Didn't receive the code? </span>
                    <button id="kc-sms-resend" type="submit" name="resendCode" value="true" class="forgot-password-link" style="background:none; border:none; padding:0; font-weight:600; cursor:pointer;">
                        Resend OTP
                    </button>
                    <span id="kc-sms-resend-timer" style="display:none; color:#6b7280; font-size:13px;"></span>
                </form>
            </div>
            <div class="register-prompt" style="margin-top: 12px;">
                <a tabindex="3" id="reset-login" href="${url.loginRestartFlowUrl}" class="signup-link">Back to Login</a>
            </div>
        </div>
        <script>
            (function () {
                const form = document.getElementById('kc-sms-resend-form');
                const button = document.getElementById('kc-sms-resend');
                const timer = document.getElementById('kc-sms-resend-timer');
                if (!form || !button || !timer) return;

                const tab = new URL(window.location.href).searchParams.get('tab_id') || 'current';
                const key = 'ceylonica-sms-sent-' + tab;
                let sentAt = Date.now();
                try {
                    const stored = Number(sessionStorage.getItem(key));
                    if (stored && stored <= sentAt) sentAt = stored;
                    else sessionStorage.setItem(key, String(sentAt));
                } catch (e) {}

                function updateTimer() {
                    const remaining = Math.max(0, Math.ceil((sentAt + 60000 - Date.now()) / 1000));
                    button.disabled = remaining > 0;
                    button.style.opacity = remaining > 0 ? '0.5' : '1';
                    button.style.cursor = remaining > 0 ? 'default' : 'pointer';
                    timer.style.display = remaining > 0 ? 'inline' : 'none';
                    timer.textContent = remaining > 0 ? ' (' + remaining + 's)' : '';
                }
                updateTimer();
                setInterval(updateTimer, 1000);
                form.addEventListener('submit', function () {
                    try { sessionStorage.setItem(key, String(Date.now())); } catch (e) {}
                });
            })();
        </script>
    </#if>
</@layout.registrationLayout>
