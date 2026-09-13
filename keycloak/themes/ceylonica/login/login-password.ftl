<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('password') displayInfo=(realm.password && realm.registrationAllowed && !registrationDisabled??); section>
    <#if section = "header">
        <#assign showSelector = (auth?has_content && auth.showTryAnotherWayLink() && !messagesPerField.existsError('password'))>
        <span id="dynamic-page-title">
            <#if showSelector>
                Select Login Method
            <#else>
                Enter Password
            </#if>
        </span>
    <#elseif section = "form">
        <div id="kc-form">
            <div id="kc-form-wrapper">
                <#if realm.password>
                    
                    <#assign showSelector = (auth?has_content && auth.showTryAnotherWayLink() && !messagesPerField.existsError('password'))>

                    <#if showSelector>
                        <!-- Method Selector UI -->
                        <div id="method-selector-container">
                            <p style="color: #6C757D; text-align: center; margin-bottom: 25px; font-size: 14px;">
                                Please choose how you would like to sign in to your account.
                            </p>
                            
                            <div class="authenticator-list" style="display: flex; flex-direction: column; gap: 15px;">
                                <!-- Password Option -->
                                <button type="button" class="authenticator-card" onclick="document.getElementById('method-selector-container').style.display='none'; document.getElementById('password-form-container').style.display='block'; document.getElementById('dynamic-page-title').innerText='Enter Password';">
                                    <div class="auth-icon-container">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="auth-icon"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                    </div>
                                    <div class="auth-text-container">
                                        <h4 class="auth-title">Password</h4>
                                        <p class="auth-desc">Sign in securely with your password</p>
                                    </div>
                                    <div class="auth-arrow">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                    </div>
                                </button>
                                
                                <!-- SMS Option -->
                                <form action="${url.loginAction}" method="post" style="margin: 0; padding: 0;">
                                    <input type="hidden" name="tryAnotherWay" value="on"/>
                                    <button type="submit" class="authenticator-card">
                                        <div class="auth-icon-container">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="auth-icon"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                        </div>
                                        <div class="auth-text-container">
                                            <h4 class="auth-title">SMS OTP</h4>
                                            <p class="auth-desc">Receive a code on your mobile number</p>
                                        </div>
                                        <div class="auth-arrow">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                        </div>
                                    </button>
                                </form>
                            </div>
                        </div>

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

                    <div id="password-form-container" <#if showSelector>style="display: none;"</#if>>
                        <form id="kc-form-login" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post" class="auth-form">

                            <div style="margin-bottom: 18px; color: #4b5563; font-size: 14px; text-align: center;">
                                Sign in by entering your password.
                            </div>

                            <!-- Password Field -->
                            <div class="form-group <#if messagesPerField.existsError('password')>has-error</#if>">
                                <label for="password" class="input-label">Password</label>
                                <div class="input-wrapper password-wrapper">
                                    <input tabindex="2" id="password" class="pill-input" name="password" type="password" autofocus autocomplete="current-password"
                                        aria-invalid="<#if messagesPerField.existsError('password')>true</#if>"
                                        placeholder="Enter your password" />
                                    <button type="button" class="eye-toggle-btn" aria-label="Toggle password visibility" onclick="togglePasswordVisibility('password', this)">
                                        <svg class="eye-icon eye-show" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                        <svg class="eye-icon eye-hide" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                        </svg>
                                    </button>
                                </div>
                                <#if messagesPerField.existsError('password')>
                                    <span class="field-error-text" aria-live="polite">
                                        ${kcSanitize(messagesPerField.get('password'))?no_esc}
                                    </span>
                                </#if>
                            </div>

                            <!-- Submit CTA Button -->
                            <div class="form-action">
                                <input type="hidden" id="id-hidden-input" name="credentialId" <#if auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if>/>
                                <button tabindex="4" class="btn-emerald" name="login" id="kc-login" type="submit">
                                    <span>Log In</span>
                                </button>
                            </div>

                            <#if showSelector>
                                <div style="margin-top: 20px; text-align: center;">
                                    <a href="#" onclick="document.getElementById('password-form-container').style.display='none'; document.getElementById('method-selector-container').style.display='block'; document.getElementById('dynamic-page-title').innerText='Select Login Method'; return false;"
                                       style="color:#059669; font-size:14px; font-weight:600; text-decoration:underline;">
                                        &larr; Back to login options
                                    </a>
                                </div>
                            </#if>
                        </form>
                    </div>
                </#if>
            </div>
        </div>
    <#elseif section = "info">
        <div class="auth-aux-links">
            <#if realm.resetPasswordAllowed>
                <div class="forgot-link-box">
                    <a tabindex="5" href="${url.loginResetCredentialsUrl}" class="forgot-password-link">
                        Forgot password?
                    </a>
                </div>
            </#if>
        </div>
    </#if>
</@layout.registrationLayout>
