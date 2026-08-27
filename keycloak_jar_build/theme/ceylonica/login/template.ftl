<#macro registrationLayout bodyClass="" displayInfo=false displayMessage=true displayRequiredFields=false>
<!DOCTYPE html>
<html lang="<#if locale?? && locale.currentLanguageTag??>${locale.currentLanguageTag}<#else>en</#if>">
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="robots" content="noindex, nofollow">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <title><#if realm?? && realm.displayName??>${realm.displayName}<#else>Ceylonica</#if> - Sign In</title>
    <link rel="icon" href="${url.resourcesPath}/img/logo.png" />
    
    <!-- Modern Google Typography -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet">
    
    <#if properties.styles?has_content>
        <#list properties.styles?split(' ') as style>
            <link href="${url.resourcesPath}/${style}" rel="stylesheet" />
        </#list>
    </#if>
</head>

<body class="nature-body ${bodyClass}">
    <!-- Lush Botanical Background Canvas -->
    <div class="nature-bg" style="background-image: url('${url.resourcesPath}/img/bg.jpg');"></div>
    <div class="nature-bg-overlay"></div>

    <!-- Main Container Frame -->
    <div class="login-wrapper">
        
        <!-- 3D Organic Paper-Cutout Card (Desktop & Responsive) -->
        <div class="paper-card">
            
            <!-- Left Pane: Modern Clean Form Content -->
            <div class="form-pane">
                
                <!-- Brand Header -->
                <div class="brand-header">
                    <div class="brand-logos">
                        <img src="${url.resourcesPath}/img/logo.png" alt="Ceylonica" class="brand-logo" />
                        <span class="brand-divider"></span>
                        <img src="${url.resourcesPath}/img/praja.png" alt="Praja" class="brand-logo" />
                    </div>
                </div>

                <!-- Alert Messages (Errors / Warnings / Success) -->
                <#if displayMessage && message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
                    <div class="alert-box alert-${message.type}">
                        <#if message.type = 'success'>
                            <svg class="alert-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                        <#elseif message.type = 'warning'>
                            <svg class="alert-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                        <#elseif message.type = 'error'>
                            <svg class="alert-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                        <#else>
                            <svg class="alert-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>
                        </#if>
                        <span class="alert-text">${kcSanitize(message.summary)?no_esc}</span>
                    </div>
                </#if>

                <!-- Page Header Title -->
                <div class="page-title-area">
                    <h1 class="page-title"><#nested "header"></h1>
                </div>

                <!-- Form Content Injection -->
                <div class="form-content">
                    <#nested "form">
                </div>

                <!-- Social Identity Providers Section -->
                <#if realm?? && realm.password && social?? && social.providers?has_content>
                    <div class="social-section">
                        <div class="divider-text">
                            <span>or log in with</span>
                        </div>
                        <div class="social-grid">
                            <#list social.providers as p>
                                <a id="social-${p.alias}" class="social-btn social-${p.alias}" href="${p.loginUrl}" title="${p.displayName}">
                                    <#if p.alias?contains("google")>
                                        <svg class="social-svg" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                                        </svg>
                                    <#elseif p.alias?contains("microsoft") || p.alias?contains("office")>
                                        <svg class="social-svg" viewBox="0 0 24 24">
                                            <path fill="#F25022" d="M1 1h10v10H1z"/>
                                            <path fill="#7FBA00" d="M13 1h10v10H13z"/>
                                            <path fill="#00A4EF" d="M1 13h10v10H1z"/>
                                            <path fill="#FFB900" d="M13 13h10v10H13z"/>
                                        </svg>
                                    <#elseif p.alias?contains("facebook")>
                                        <svg class="social-svg" viewBox="0 0 24 24" fill="#1877F2">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                        </svg>
                                    <#elseif p.alias?contains("github")>
                                        <svg class="social-svg" viewBox="0 0 24 24" fill="#24292e">
                                            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                                        </svg>
                                    <#else>
                                        <span>${p.displayName}</span>
                                    </#if>
                                </a>
                            </#list>
                        </div>
                    </div>
                <#else>
                    <!-- Default Mockup Social Icons when no external IdP is registered -->
                    <div class="social-section">
                        <div class="divider-text">
                            <span>or log in with</span>
                        </div>
                        <div class="social-grid">
                            <button type="button" class="social-btn social-google" title="Google Login">
                                <svg class="social-svg" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                                </svg>
                            </button>
                            <button type="button" class="social-btn social-microsoft" title="Microsoft Login">
                                <svg class="social-svg" viewBox="0 0 24 24">
                                    <path fill="#F25022" d="M1 1h10v10H1z"/>
                                    <path fill="#7FBA00" d="M13 1h10v10H13z"/>
                                    <path fill="#00A4EF" d="M1 13h10v10H1z"/>
                                    <path fill="#FFB900" d="M13 13h10v10H13z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </#if>

                <!-- Auxiliary Footer Navigation / Info -->
                <div class="form-footer">
                    <#nested "info">
                </div>

            </div>

            <!-- Right Pane: 3D Paper Cutout Botanical Jungle Showcase -->
            <div class="botanical-pane">
                
                <!-- 3D Organic Multi-Layer SVG Paper Cutout Waves with Realistic Physical Shadows -->
                <svg class="paper-curve-svg" viewBox="0 0 140 600" preserveAspectRatio="none">
                    <defs>
                        <filter id="shadow-deep" x="-50%" y="-20%" width="200%" height="140%">
                            <feDropShadow dx="-10" dy="2" stdDeviation="12" flood-color="#05150d" flood-opacity="0.5"/>
                            <feDropShadow dx="-4" dy="1" stdDeviation="4" flood-color="#05150d" flood-opacity="0.3"/>
                        </filter>
                        <filter id="shadow-mid" x="-30%" y="-20%" width="160%" height="140%">
                            <feDropShadow dx="-6" dy="1" stdDeviation="6" flood-color="#0a1f14" flood-opacity="0.35"/>
                        </filter>
                        <filter id="shadow-subtle" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="-3" dy="1" stdDeviation="3" flood-color="#0a1f14" flood-opacity="0.25"/>
                        </filter>
                    </defs>
                    <!-- Layer 3: Deep shadow contour tier -->
                    <path d="M 0,0 L 40,0 C 15,120 5,220 75,340 C 125,440 25,520 40,600 L 0,600 Z" fill="#142c20" filter="url(#shadow-deep)" />
                    <!-- Layer 2: Mid-tone green paper transition tier -->
                    <path d="M 0,0 L 28,0 C 8,120 0,220 62,340 C 110,440 18,520 28,600 L 0,600 Z" fill="#224433" filter="url(#shadow-mid)" />
                    <!-- Layer 1: Front pure white card sculpted edge -->
                    <path d="M 0,0 L 16,0 C -2,120 -8,220 50,340 C 95,440 10,520 16,600 L 0,600 Z" fill="#ffffff" filter="url(#shadow-deep)" />
                </svg>
                
                <!-- Inner Deep Botanical Jungle Canvas -->
                <div class="botanical-canvas" style="background-image: url('${url.resourcesPath}/img/botanical.jpg');">
                    <div class="botanical-vignette"></div>
                </div>

            </div>

        </div>

    </div>

    <#if properties.scripts?has_content>
        <#list properties.scripts?split(' ') as script>
            <script src="${url.resourcesPath}/${script}" type="text/javascript"></script>
        </#list>
    </#if>
</body>
</html>
</#macro>
