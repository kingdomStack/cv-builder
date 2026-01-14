// ===== CV BUILDER APPLICATION =====
class CVBuilder {
    constructor() {
        this.currentTemplate = 'classic';
        this.cvData = {};
        this.history = [];
        this.currentStep = -1;
        this.autoSaveInterval = null;
        this.lastSaveTime = new Date();
        this.hasUnsavedChangesFlag = false;
        this.isMobile = false;
        this.mobileTipsShown = false;
        this.fabMenuOpen = false;
        
        this.initialize();
    }

    // ===== INITIALIZATION =====
    initialize() {
        this.cacheElements();
        this.bindEvents();
        this.setupTemplates();
        this.updateProgress();
        this.updateLastSaveTime();
        this.checkSavedData();
        this.initMobileFeatures();
    }

    cacheElements() {
        // Core elements
        this.elements = {
            welcomeScreen: document.getElementById('welcomeScreen'),
            templateSelection: document.getElementById('templateSelection'),
            editorContainer: document.getElementById('editorContainer'),
            cvPaper: document.getElementById('cvPaper'),
            toastContainer: document.getElementById('toastContainer'),
            
            // Mobile elements
            mobileTips: document.getElementById('mobileTips'),
            mobileFab: document.getElementById('mobileFab'),
            mobileMenu: document.getElementById('mobileMenu'),
            mobileToolbar: document.getElementById('mobileToolbar'),
            
            // Progress elements
            progressFill: document.getElementById('progressFill'),
            progressText: document.getElementById('progressText'),
            lastSaveTime: document.getElementById('lastSaveTime'),
            
            // Button elements
            undoBtn: document.getElementById('undoBtn'),
            redoBtn: document.getElementById('redoBtn'),
            getStartedBtn: document.getElementById('getStartedBtn'),
            closeMobileTipsBtn: document.getElementById('closeMobileTipsBtn'),
            closeMobileMenuBtn: document.getElementById('closeMobileMenuBtn'),
            
            // Form inputs
            inputName: document.getElementById('inputName'),
            inputTitle: document.getElementById('inputTitle'),
            inputEmail: document.getElementById('inputEmail'),
            inputPhone: document.getElementById('inputPhone'),
            inputLocation: document.getElementById('inputLocation'),
            inputLinkedin: document.getElementById('inputLinkedin'),
            inputColor: document.getElementById('inputColor'),
            inputFontSize: document.getElementById('inputFontSize'),
            fontSizeValue: document.getElementById('fontSizeValue'),
            
            // Action buttons
            changeTemplateBtn: document.getElementById('changeTemplateBtn'),
            downloadPdfBtn: document.getElementById('downloadPdfBtn'),
            exportCvBtn: document.getElementById('exportCvBtn'),
            saveDraftBtn: document.getElementById('saveDraftBtn'),
            loadDraftBtn: document.getElementById('loadDraftBtn'),
            resetCvBtn: document.getElementById('resetCvBtn')
        };
    }

    bindEvents() {
        // Welcome screen
        if (this.elements.getStartedBtn) {
            this.elements.getStartedBtn.addEventListener('click', () => this.showTemplates());
        }

        // Template selection
        document.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const template = e.currentTarget.dataset.template;
                if (template) this.selectTemplate(template);
            });
        });

        // Form inputs
        const inputs = [
            'inputName', 'inputTitle', 'inputEmail', 'inputPhone',
            'inputLocation', 'inputLinkedin', 'inputColor', 'inputFontSize'
        ];
        
        inputs.forEach(inputId => {
            const element = this.elements[inputId];
            if (element) {
                element.addEventListener('input', (e) => this.handleInputChange(e));
            }
        });

        // Action buttons
        const actions = {
            changeTemplateBtn: () => this.changeTemplate(),
            downloadPdfBtn: () => window.print(),
            exportCvBtn: () => this.exportCV(),
            saveDraftBtn: () => this.saveCV(),
            loadDraftBtn: () => this.loadCV(),
            resetCvBtn: () => this.resetCV(),
            closeMobileTipsBtn: () => this.closeMobileTips(),
            closeMobileMenuBtn: () => this.closeMobileMenu(),
            undoBtn: () => this.undo(),
            redoBtn: () => this.redo(),
            mobileFab: () => this.toggleMobileFab()
        };

        Object.entries(actions).forEach(([elementId, handler]) => {
            const element = this.elements[elementId];
            if (element) {
                element.addEventListener('click', handler);
            }
        });

        // Mobile toolbar
        if (this.elements.mobileToolbar) {
            this.elements.mobileToolbar.addEventListener('click', (e) => {
                const button = e.target.closest('.mobile-toolbar-btn');
                if (button) {
                    const action = button.dataset.action;
                    this.mobileToolbarAction(action, e);
                }
            });
        }

        // Mobile menu actions
        if (this.elements.mobileMenu) {
            this.elements.mobileMenu.addEventListener('click', (e) => {
                const button = e.target.closest('[data-action]');
                if (button) {
                    const action = button.dataset.action;
                    this.handleMobileMenuAction(action);
                }
            });
        }

        // Quick actions
        document.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleAction(action);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Before unload warning
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChangesFlag) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            }
        });

        // Window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    // ===== TEMPLATE MANAGEMENT =====
    setupTemplates() {
        this.templates = {
            classic: this.getClassicTemplate(),
            modern: this.getModernTemplate(),
            minimalist: this.getMinimalistTemplate(),
            elite: this.getEliteTemplate()
        };
    }

    getClassicTemplate() {
        return `
            <div class="cv-header">
                <h1 class="cv-name" contenteditable="true" id="cvName">Your Full Name</h1>
                <h2 class="cv-title" contenteditable="true" id="cvTitle">Your Professional Title</h2>
                
                <div class="cv-contact">
                    <div class="contact-item">
                        <i class="fas fa-envelope"></i>
                        <span contenteditable="true" id="cvEmail">your.email@example.com</span>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-phone"></i>
                        <span contenteditable="true" id="cvPhone">+1 (555) 123-4567</span>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span contenteditable="true" id="cvLocation">City, Country</span>
                    </div>
                    <div class="contact-item">
                        <i class="fab fa-linkedin"></i>
                        <span contenteditable="true" id="cvLinkedin">linkedin.com/in/yourprofile</span>
                    </div>
                </div>
            </div>
            
            <div class="cv-body">
                <div class="cv-section">
                    <h3 class="section-title">Professional Summary</h3>
                    <div class="section-content" contenteditable="true" id="cvSummary">
                        Results-driven professional with extensive experience in delivering high-impact solutions. Proven track record of exceeding targets and driving business growth. Excellent communicator and collaborative team player with strong analytical skills.
                    </div>
                </div>
                
                <div class="cv-section">
                    <h3 class="section-title">Work Experience</h3>
                    <div class="section-content" id="experienceContainer">
                        <div class="timeline-item">
                            <div class="item-header">
                                <div>
                                    <div class="item-title" contenteditable="true">Senior Software Engineer</div>
                                    <div class="item-subtitle" contenteditable="true">Tech Company Inc. • San Francisco, CA</div>
                                </div>
                                <div class="item-date" contenteditable="true">2020 - Present</div>
                            </div>
                            <div class="item-description" contenteditable="true">
                                Led development of cloud-based applications serving 100K+ users. Mentored junior developers and established coding standards. Improved system performance by 40% through optimization initiatives.
                            </div>
                        </div>
                        
                        <div class="timeline-item">
                            <div class="item-header">
                                <div>
                                    <div class="item-title" contenteditable="true">Software Engineer</div>
                                    <div class="item-subtitle" contenteditable="true">Digital Solutions Ltd. • New York, NY</div>
                                </div>
                                <div class="item-date" contenteditable="true">2017 - 2020</div>
                            </div>
                            <div class="item-description" contenteditable="true">
                                Developed and maintained multiple web applications using modern frameworks. Collaborated with cross-functional teams to deliver projects on time. Implemented automated testing reducing bugs by 60%.
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="cv-section">
                    <h3 class="section-title">Education</h3>
                    <div class="section-content" id="educationContainer">
                        <div class="timeline-item">
                            <div class="item-header">
                                <div>
                                    <div class="item-title" contenteditable="true">Bachelor of Science in Computer Science</div>
                                    <div class="item-subtitle" contenteditable="true">University Name • City, State</div>
                                </div>
                                <div class="item-date" contenteditable="true">2013 - 2017</div>
                            </div>
                            <div class="item-description" contenteditable="true">
                                Graduated with honors. Relevant coursework: Data Structures, Algorithms, Software Engineering, Database Systems.
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="cv-section">
                    <h3 class="section-title">Technical Skills</h3>
                    <div class="section-content">
                        <div class="skills-grid" id="skillsContainer">
                            <div class="skill-item">
                                <div class="skill-name" contenteditable="true">JavaScript/TypeScript</div>
                                <div class="skill-bar">
                                    <div class="skill-progress" style="width: 90%"></div>
                                </div>
                            </div>
                            <div class="skill-item">
                                <div class="skill-name" contenteditable="true">React & Node.js</div>
                                <div class="skill-bar">
                                    <div class="skill-progress" style="width: 85%"></div>
                                </div>
                            </div>
                            <div class="skill-item">
                                <div class="skill-name" contenteditable="true">Python & Django</div>
                                <div class="skill-bar">
                                    <div class="skill-progress" style="width: 80%"></div>
                                </div>
                            </div>
                            <div class="skill-item">
                                <div class="skill-name" contenteditable="true">Cloud (AWS/Azure)</div>
                                <div class="skill-bar">
                                    <div class="skill-progress" style="width: 75%"></div>
                                </div>
                            </div>
                            <div class="skill-item">
                                <div class="skill-name" contenteditable="true">DevOps & CI/CD</div>
                                <div class="skill-bar">
                                    <div class="skill-progress" style="width: 70%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getModernTemplate() {
        return `
            <div class="cv-sidebar">
                <h1 class="cv-name" contenteditable="true" id="cvName">Your Full Name</h1>
                <h2 class="cv-title" contenteditable="true" id="cvTitle">Your Professional Title</h2>
                
                <div class="sidebar-section">
                    <h3>Contact</h3>
                    <div class="contact-list">
                        <div class="contact-item">
                            <i class="fas fa-envelope"></i>
                            <span contenteditable="true" id="cvEmail">email@example.com</span>
                        </div>
                        <div class="contact-item">
                            <i class="fas fa-phone"></i>
                            <span contenteditable="true" id="cvPhone">+1 (555) 123-4567</span>
                        </div>
                        <div class="contact-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span contenteditable="true" id="cvLocation">City, Country</span>
                        </div>
                        <div class="contact-item">
                            <i class="fab fa-linkedin"></i>
                            <span contenteditable="true" id="cvLinkedin">linkedin.com/in/you</span>
                        </div>
                    </div>
                </div>
                
                <div class="sidebar-section">
                    <h3>Skills</h3>
                    <div class="skills-list" contenteditable="true" id="cvSkills">
                        • JavaScript/TypeScript<br>
                        • React & Node.js<br>
                        • Python & Django<br>
                        • Cloud (AWS/Azure)<br>
                        • DevOps & CI/CD
                    </div>
                </div>
            </div>
            
            <div class="cv-main">
                <div class="cv-section">
                    <h3 class="section-title">About Me</h3>
                    <div class="section-content" contenteditable="true" id="cvSummary">
                        Results-driven professional with extensive experience in delivering high-impact solutions. Proven track record of exceeding targets and driving business growth.
                    </div>
                </div>
                
                <div class="cv-section">
                    <h3 class="section-title">Experience</h3>
                    <div class="section-content" id="experienceContainer">
                        <div class="timeline-item">
                            <div class="item-header">
                                <div>
                                    <div class="item-title" contenteditable="true">Senior Software Engineer</div>
                                    <div class="item-subtitle" contenteditable="true">Tech Company Inc.</div>
                                </div>
                                <div class="item-date" contenteditable="true">2020 - Present</div>
                            </div>
                            <div class="item-description" contenteditable="true">
                                Led development of cloud-based applications. Mentored junior developers and established coding standards.
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="cv-section">
                    <h3 class="section-title">Education</h3>
                    <div class="section-content" id="educationContainer">
                        <div class="timeline-item">
                            <div class="item-header">
                                <div>
                                    <div class="item-title" contenteditable="true">Bachelor of Science in Computer Science</div>
                                    <div class="item-subtitle" contenteditable="true">University Name</div>
                                </div>
                                <div class="item-date" contenteditable="true">2013 - 2017</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getMinimalistTemplate() {
        return `
            <div class="cv-header">
                <h1 class="cv-name" contenteditable="true" id="cvName">Your Full Name</h1>
                <h2 class="cv-title" contenteditable="true" id="cvTitle">Your Professional Title</h2>
                <div class="contact-minimalist">
                    <span contenteditable="true" id="cvEmail">email@example.com</span> •
                    <span contenteditable="true" id="cvPhone">+1 (555) 123-4567</span> •
                    <span contenteditable="true" id="cvLocation">City, Country</span> •
                    <span contenteditable="true" id="cvLinkedin">linkedin.com/in/you</span>
                </div>
            </div>
            
            <div class="cv-body">
                <div class="cv-section">
                    <h3 class="section-title">Professional Summary</h3>
                    <div class="section-content" contenteditable="true" id="cvSummary">
                        Results-driven professional with extensive experience in delivering high-impact solutions. Proven track record of exceeding targets and driving business growth.
                    </div>
                </div>
                
                <div class="cv-section">
                    <h3 class="section-title">Experience</h3>
                    <div class="section-content" id="experienceContainer">
                        <div class="timeline-item">
                            <div class="item-header">
                                <div>
                                    <div class="item-title" contenteditable="true">Senior Software Engineer</div>
                                    <div class="item-subtitle" contenteditable="true">Tech Company Inc. • City</div>
                                </div>
                                <div class="item-date" contenteditable="true">2020 - Present</div>
                            </div>
                            <div class="item-description" contenteditable="true">
                                Led development of cloud-based applications. Mentored junior developers.
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="cv-section">
                    <h3 class="section-title">Education</h3>
                    <div class="section-content" id="educationContainer">
                        <div class="timeline-item">
                            <div class="item-header">
                                <div>
                                    <div class="item-title" contenteditable="true">Bachelor of Science in Computer Science</div>
                                    <div class="item-subtitle" contenteditable="true">University Name</div>
                                </div>
                                <div class="item-date" contenteditable="true">2013 - 2017</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="cv-section">
                    <h3 class="section-title">Skills</h3>
                    <div class="section-content skills-inline" contenteditable="true" id="cvSkills">
                        <span>JavaScript/TypeScript</span> •
                        <span>React & Node.js</span> •
                        <span>Python</span> •
                        <span>Cloud (AWS)</span> •
                        <span>DevOps</span>
                    </div>
                </div>
            </div>
        `;
    }

    getEliteTemplate() {
        return `
            <div class="elite-accent"></div>
            <div class="elite-content">
                <div class="elite-header">
                    <div class="elite-name-wrapper">
                        <h1 class="elite-name" contenteditable="true" id="cvName">Your Full Name</h1>
                    </div>
                    <h2 class="elite-title" contenteditable="true" id="cvTitle">Your Professional Title</h2>
                    
                    <div class="elite-contact">
                        <div class="elite-contact-item">
                            <i class="fas fa-envelope"></i>
                            <span contenteditable="true" id="cvEmail">email@example.com</span>
                        </div>
                        <div class="elite-contact-item">
                            <i class="fas fa-phone"></i>
                            <span contenteditable="true" id="cvPhone">+1 (555) 123-4567</span>
                        </div>
                        <div class="elite-contact-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span contenteditable="true" id="cvLocation">City, Country</span>
                        </div>
                        <div class="elite-contact-item">
                            <i class="fab fa-linkedin"></i>
                            <span contenteditable="true" id="cvLinkedin">linkedin.com/in/yourprofile</span>
                        </div>
                    </div>
                </div>

                <div class="elite-section">
                    <div class="elite-section-header">
                        <div class="elite-section-icon">
                            <i class="fas fa-user"></i>
                        </div>
                        <h3 class="elite-section-title">Executive Profile</h3>
                        <div class="elite-section-line"></div>
                    </div>
                    <div class="elite-summary" contenteditable="true" id="cvSummary">
                        Results-driven executive with extensive experience in delivering high-impact solutions. Proven track record of exceeding targets and driving business growth. Strategic leader with strong analytical skills and excellent communication abilities.
                    </div>
                </div>

                <div class="elite-section">
                    <div class="elite-section-header">
                        <div class="elite-section-icon">
                            <i class="fas fa-briefcase"></i>
                        </div>
                        <h3 class="elite-section-title">Professional Experience</h3>
                        <div class="elite-section-line"></div>
                    </div>

                    <div class="elite-timeline-item">
                        <div class="elite-item-header">
                            <div>
                                <div class="elite-item-title" contenteditable="true">Senior Software Engineer</div>
                                <div class="elite-item-company" contenteditable="true">Tech Company Inc.</div>
                                <div class="elite-item-location" contenteditable="true">San Francisco, CA</div>
                            </div>
                            <div class="elite-item-date" contenteditable="true">2020 - Present</div>
                        </div>
                        <div class="elite-item-description" contenteditable="true">
                            Led development of cloud-based applications. Mentored junior developers and established coding standards.
                            <ul>
                                <li>Improved system performance by 40% through optimization initiatives</li>
                                <li>Led development of cloud-based applications serving 100K+ users</li>
                                <li>Established coding standards and best practices</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="elite-section">
                    <div class="elite-section-header">
                        <div class="elite-section-icon">
                            <i class="fas fa-graduation-cap"></i>
                        </div>
                        <h3 class="elite-section-title">Education & Credentials</h3>
                        <div class="elite-section-line"></div>
                    </div>

                    <div class="elite-education-item">
                        <div class="elite-degree" contenteditable="true">Bachelor of Science in Computer Science</div>
                        <div class="elite-institution" contenteditable="true">University Name</div>
                        <div class="elite-education-details">
                            <div class="elite-education-detail">
                                <i class="fas fa-calendar"></i>
                                <span contenteditable="true">2013 - 2017</span>
                            </div>
                            <div class="elite-education-detail">
                                <i class="fas fa-award"></i>
                                <span contenteditable="true">Graduated with Honors</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="elite-section">
                    <div class="elite-section-header">
                        <div class="elite-section-icon">
                            <i class="fas fa-lightbulb"></i>
                        </div>
                        <h3 class="elite-section-title">Core Competencies</h3>
                        <div class="elite-section-line"></div>
                    </div>

                    <div class="elite-skills-grid">
                        <div class="elite-skill-category">
                            <div class="elite-skill-category-title">
                                <i class="fas fa-chart-line"></i>
                                <span contenteditable="true">Technical Skills</span>
                            </div>
                            <div class="elite-skill-list">
                                <span class="elite-skill-tag" contenteditable="true">JavaScript/TypeScript</span>
                                <span class="elite-skill-tag" contenteditable="true">React & Node.js</span>
                                <span class="elite-skill-tag" contenteditable="true">Python & Django</span>
                                <span class="elite-skill-tag" contenteditable="true">Cloud (AWS/Azure)</span>
                            </div>
                        </div>

                        <div class="elite-skill-category">
                            <div class="elite-skill-category-title">
                                <i class="fas fa-users"></i>
                                <span contenteditable="true">Soft Skills</span>
                            </div>
                            <div class="elite-skill-list">
                                <span class="elite-skill-tag" contenteditable="true">Leadership</span>
                                <span class="elite-skill-tag" contenteditable="true">Communication</span>
                                <span class="elite-skill-tag" contenteditable="true">Project Management</span>
                                <span class="elite-skill-tag" contenteditable="true">Strategic Planning</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="elite-footer">
                    <div class="elite-footer-text" contenteditable="true">References available upon request</div>
                </div>
            </div>
        `;
    }

    // ===== TEMPLATE FUNCTIONS =====
    showTemplates() {
        if (this.elements.welcomeScreen) {
            this.elements.welcomeScreen.classList.add('hide');
        }
        
        setTimeout(() => {
            if (this.elements.templateSelection) {
                this.elements.templateSelection.classList.add('active');
            }
        }, 500);
    }

    selectTemplate(template) {
        this.currentTemplate = template;
        
        if (this.elements.templateSelection) {
            this.elements.templateSelection.classList.remove('active');
        }
        
        if (this.elements.editorContainer) {
            this.elements.editorContainer.classList.add('active');
        }
        
        if (this.elements.cvPaper) {
            this.elements.cvPaper.className = `cv-paper template-${template}`;
            this.elements.cvPaper.innerHTML = this.templates[template] || this.templates.classic;
        }
        
        this.saveHistoryState();
        this.startAutoSave();
        this.attachEditableListeners();
        this.updateCV();
        this.updateProgress();
        
        this.showToast('Template selected! Start editing your CV.', 'success', 'Ready to edit!');
        
        // Show mobile toolbar
        if (this.elements.mobileToolbar) this.elements.mobileToolbar.style.display = 'flex';
        if (this.elements.mobileFab) this.elements.mobileFab.style.display = 'flex';
        
        // Show mobile tips if first time
        if (this.isMobile && !this.mobileTipsShown) {
            setTimeout(() => {
                this.showMobileTips();
                this.mobileTipsShown = true;
            }, 1000);
        }
    }

    changeTemplate() {
        if (confirm('Changing templates will reset your content. Continue?')) {
            if (this.elements.editorContainer) {
                this.elements.editorContainer.classList.remove('active');
            }
            
            if (this.elements.templateSelection) {
                this.elements.templateSelection.classList.add('active');
            }
            
            this.showToast('Select a new template to continue', 'warning', 'Template selection');
        }
    }

    // ===== EDITOR FUNCTIONS =====
    attachEditableListeners() {
        const editableElements = this.elements.cvPaper?.querySelectorAll('[contenteditable="true"]');
        if (!editableElements) return;

        editableElements.forEach(element => {
            // Remove existing listeners
            const newElement = element.cloneNode(true);
            if (element.parentNode) {
                element.parentNode.replaceChild(newElement, element);
            }
            
            // Add new listeners
            newElement.addEventListener('input', () => this.handleContentEditableChange(newElement));
            newElement.addEventListener('blur', () => this.saveHistoryState());
        });
    }

    handleInputChange(event) {
        this.hasUnsavedChangesFlag = true;
        this.saveHistoryState();
        this.updateCV();
        this.updateProgress();
        
        if (event.target.id === 'inputFontSize') {
            this.elements.fontSizeValue.textContent = event.target.value + 'px';
        }
    }

    handleContentEditableChange(element) {
        this.hasUnsavedChangesFlag = true;
        this.saveHistoryState();
        this.updateProgress();
    }

    updateCV() {
        const inputs = ['Name', 'Title', 'Email', 'Phone', 'Location', 'Linkedin'];
        
        inputs.forEach(field => {
            const inputElement = this.elements[`input${field}`];
            const cvElement = document.getElementById(`cv${field}`);
            
            if (inputElement && cvElement) {
                cvElement.textContent = inputElement.value;
            }
        });
        
        // Update color
        this.changeColor(this.elements.inputColor.value);
        
        // Update font size
        this.changeFontSize(this.elements.inputFontSize.value);
    }

    changeColor(color) {
        document.documentElement.style.setProperty('--primary', color);
        
        if (this.currentTemplate === 'elite') {
            const existingOverride = document.getElementById('elite-color-override');
            if (existingOverride) existingOverride.remove();
            
            const style = document.createElement('style');
            style.id = 'elite-color-override';
            style.textContent = `
                .template-elite .elite-name::after,
                .template-elite .elite-section-icon,
                .template-elite .elite-section-line,
                .template-elite .elite-timeline-item::before,
                .template-elite .elite-education-item::before,
                .template-elite .elite-skill-category {
                    background: ${color};
                }
                .template-elite .elite-contact-item i,
                .template-elite .elite-item-date,
                .template-elite .elite-education-detail i,
                .template-elite .elite-skill-category-title i {
                    color: ${color};
                }
                .template-elite .elite-item-date {
                    border-color: ${color}40;
                    background: ${color}15;
                }
                .template-elite .elite-skill-tag {
                    border-color: ${color}30;
                }
            `;
            document.head.appendChild(style);
        }
    }

    changeFontSize(size) {
        if (this.elements.cvPaper) {
            this.elements.cvPaper.style.fontSize = size + 'px';
        }
    }

    // ===== HISTORY MANAGEMENT =====
    saveHistoryState() {
        if (!this.elements.cvPaper) return;
        
        const state = {
            template: this.currentTemplate,
            cvPaper: this.elements.cvPaper.innerHTML,
            inputs: {
                name: this.elements.inputName.value,
                title: this.elements.inputTitle.value,
                email: this.elements.inputEmail.value,
                phone: this.elements.inputPhone.value,
                location: this.elements.inputLocation.value,
                linkedin: this.elements.inputLinkedin.value
            },
            color: this.elements.inputColor.value,
            fontSize: this.elements.inputFontSize.value
        };
        
        if (this.history.length === 0 || JSON.stringify(state) !== JSON.stringify(this.history[this.currentStep])) {
            this.history = this.history.slice(0, this.currentStep + 1);
            this.history.push(state);
            this.currentStep++;
            this.updateUndoRedoButtons();
        }
    }

    updateUndoRedoButtons() {
        if (this.elements.undoBtn) {
            this.elements.undoBtn.disabled = this.currentStep <= 0;
        }
        
        if (this.elements.redoBtn) {
            this.elements.redoBtn.disabled = this.currentStep >= this.history.length - 1;
        }
    }

    undo() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.restoreState(this.history[this.currentStep]);
            this.showToast('Undo successful', 'success', 'Action undone');
        }
    }

    redo() {
        if (this.currentStep < this.history.length - 1) {
            this.currentStep++;
            this.restoreState(this.history[this.currentStep]);
            this.showToast('Redo successful', 'success', 'Action redone');
        }
    }

    restoreState(state) {
        this.currentTemplate = state.template;
        
        if (this.elements.cvPaper) {
            this.elements.cvPaper.innerHTML = state.cvPaper;
            this.elements.cvPaper.className = `cv-paper template-${this.currentTemplate}`;
        }
        
        // Restore inputs
        this.elements.inputName.value = state.inputs.name;
        this.elements.inputTitle.value = state.inputs.title;
        this.elements.inputEmail.value = state.inputs.email;
        this.elements.inputPhone.value = state.inputs.phone;
        this.elements.inputLocation.value = state.inputs.location;
        this.elements.inputLinkedin.value = state.inputs.linkedin;
        
        // Restore customization
        this.elements.inputColor.value = state.color;
        this.elements.inputFontSize.value = state.fontSize;
        this.elements.fontSizeValue.textContent = state.fontSize + 'px';
        
        // Update CV
        this.updateCV();
        this.updateProgress();
        this.attachEditableListeners();
    }

    // ===== AUTO-SAVE =====
    startAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        this.autoSaveInterval = setInterval(() => {
            if (this.hasUnsavedChangesFlag) {
                this.saveCV();
                this.hasUnsavedChangesFlag = false;
            }
        }, 10000); // Every 10 seconds
    }

    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }

    // ===== PROGRESS & SAVE =====
    calculateCompletion() {
        const checks = [];
        
        // Personal info
        if (this.elements.inputName) checks.push(this.elements.inputName.value.trim().length > 0);
        if (this.elements.inputTitle) checks.push(this.elements.inputTitle.value.trim().length > 0);
        if (this.elements.inputEmail) checks.push(this.elements.inputEmail.value.includes('@'));
        
        // Content
        const summary = document.getElementById('cvSummary');
        if (summary) checks.push(summary.textContent.trim().length > 50);
        
        const experienceItems = document.querySelectorAll('.timeline-item, .elite-timeline-item').length;
        checks.push(experienceItems > 0);
        
        const educationItems = document.querySelectorAll('#educationContainer .timeline-item, .elite-education-item').length;
        checks.push(educationItems > 0);
        
        const completed = checks.filter(Boolean).length;
        return checks.length > 0 ? Math.round((completed / checks.length) * 100) : 0;
    }

    updateProgress() {
        const percentage = this.calculateCompletion();
        
        if (this.elements.progressFill) {
            this.elements.progressFill.style.width = percentage + '%';
            
            // Update color
            if (percentage < 30) {
                this.elements.progressFill.style.background = 'var(--danger)';
            } else if (percentage < 70) {
                this.elements.progressFill.style.background = 'var(--warning)';
            } else {
                this.elements.progressFill.style.background = 'var(--success)';
            }
        }
        
        if (this.elements.progressText) {
            this.elements.progressText.textContent = percentage + '%';
        }
    }

    updateLastSaveTime() {
        const now = new Date();
        const diffInSeconds = Math.floor((now - this.lastSaveTime) / 1000);
        
        let displayText;
        if (diffInSeconds < 60) {
            displayText = 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            displayText = `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        } else {
            const hours = Math.floor(diffInSeconds / 3600);
            displayText = `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        }
        
        if (this.elements.lastSaveTime) {
            this.elements.lastSaveTime.textContent = displayText;
        }
    }

    saveCV() {
        if (!this.elements.cvPaper) return;
        
        this.cvData = {
            template: this.currentTemplate,
            html: this.elements.cvPaper.innerHTML,
            inputs: {
                name: this.elements.inputName.value,
                title: this.elements.inputTitle.value,
                email: this.elements.inputEmail.value,
                phone: this.elements.inputPhone.value,
                location: this.elements.inputLocation.value,
                linkedin: this.elements.inputLinkedin.value
            }
        };
        
        this.lastSaveTime = new Date();
        this.updateLastSaveTime();
        this.hasUnsavedChangesFlag = false;
        
        try {
            localStorage.setItem('cvBuilderData', JSON.stringify(this.cvData));
            this.showToast('CV saved successfully!', 'success', 'Auto-saved');
        } catch (e) {
            this.showToast('Failed to save CV. Local storage may be full.', 'error', 'Save failed');
            console.error('LocalStorage error:', e);
        }
    }

    loadCV() {
        try {
            const savedData = localStorage.getItem('cvBuilderData');
            if (savedData) {
                this.cvData = JSON.parse(savedData);
                this.currentTemplate = this.cvData.template || 'classic';
                
                if (this.elements.cvPaper) {
                    this.elements.cvPaper.className = `cv-paper template-${this.currentTemplate}`;
                    this.elements.cvPaper.innerHTML = this.cvData.html;
                }
                
                if (this.cvData.inputs) {
                    this.elements.inputName.value = this.cvData.inputs.name;
                    this.elements.inputTitle.value = this.cvData.inputs.title;
                    this.elements.inputEmail.value = this.cvData.inputs.email;
                    this.elements.inputPhone.value = this.cvData.inputs.phone;
                    this.elements.inputLocation.value = this.cvData.inputs.location;
                    this.elements.inputLinkedin.value = this.cvData.inputs.linkedin;
                }
                
                this.updateCV();
                this.attachEditableListeners();
                this.updateProgress();
                this.saveHistoryState();
                
                this.showToast('CV loaded from previous session', 'success', 'Session restored');
            } else {
                this.showToast('No saved CV found. Start by creating a new one.', 'warning', 'No data found');
            }
        } catch (e) {
            this.showToast('Failed to load CV data. The file may be corrupted.', 'error', 'Load failed');
            console.error('Load error:', e);
        }
    }

    resetCV() {
        if (confirm('Are you sure you want to reset your CV? This cannot be undone.')) {
            // Reset inputs
            this.elements.inputName.value = 'Your Full Name';
            this.elements.inputTitle.value = 'Your Professional Title';
            this.elements.inputEmail.value = 'your.email@example.com';
            this.elements.inputPhone.value = '+1 (555) 123-4567';
            this.elements.inputLocation.value = 'City, Country';
            this.elements.inputLinkedin.value = 'linkedin.com/in/yourprofile';
            this.elements.inputColor.value = '#4F46E5';
            this.elements.inputFontSize.value = '14';
            this.elements.fontSizeValue.textContent = '14px';
            
            // Reset template
            this.currentTemplate = 'classic';
            if (this.elements.cvPaper) {
                this.elements.cvPaper.className = 'cv-paper template-classic';
                this.elements.cvPaper.innerHTML = this.templates.classic;
            }
            
            // Update everything
            this.updateCV();
            this.attachEditableListeners();
            this.updateProgress();
            this.saveHistoryState();
            
            // Clear localStorage
            localStorage.removeItem('cvBuilderData');
            
            this.showToast('CV has been reset to default', 'success', 'Reset complete');
        }
    }

    exportCV() {
        window.print();
        this.showToast('Use the print dialog to save as PDF', 'info', 'Export CV');
    }

    // ===== SECTION MANAGEMENT =====
    addSection(type) {
        this.hasUnsavedChangesFlag = true;
        
        switch (type) {
            case 'experience':
                this.addExperienceSection();
                break;
            case 'education':
                this.addEducationSection();
                break;
            case 'skill':
                this.addSkillSection();
                break;
        }
        
        this.attachEditableListeners();
        this.saveHistoryState();
        this.updateProgress();
    }

    addExperienceSection() {
        if (this.currentTemplate === 'elite') {
            const experienceContainer = document.querySelector('.elite-section:nth-child(2)');
            if (experienceContainer) {
                const newSection = document.createElement('div');
                newSection.className = 'elite-timeline-item';
                newSection.innerHTML = `
                    <div class="elite-item-header">
                        <div>
                            <div class="elite-item-title" contenteditable="true">Job Title</div>
                            <div class="elite-item-company" contenteditable="true">Company Name</div>
                            <div class="elite-item-location" contenteditable="true">Location</div>
                        </div>
                        <div class="elite-item-date" contenteditable="true">Year - Year</div>
                    </div>
                    <div class="elite-item-description" contenteditable="true">
                        <ul>
                            <li>Describe your responsibilities and achievements...</li>
                            <li>Use bullet points for key accomplishments</li>
                        </ul>
                    </div>
                `;
                experienceContainer.appendChild(newSection);
                this.showToast('New experience section added', 'success', 'Section added');
            }
        } else {
            let experienceContainer = document.getElementById('experienceContainer');
            if (!experienceContainer) {
                experienceContainer = document.querySelector('[id*="experience"], .section-content');
            }
            
            if (experienceContainer) {
                const newSection = document.createElement('div');
                newSection.className = 'timeline-item';
                newSection.innerHTML = `
                    <div class="item-header">
                        <div>
                            <div class="item-title" contenteditable="true">Job Title</div>
                            <div class="item-subtitle" contenteditable="true">Company Name • Location</div>
                        </div>
                        <div class="item-date" contenteditable="true">Year - Year</div>
                    </div>
                    <div class="item-description" contenteditable="true">
                        Describe your responsibilities and achievements...
                    </div>
                `;
                experienceContainer.appendChild(newSection);
                this.showToast('New experience section added', 'success', 'Section added');
            }
        }
    }

    addEducationSection() {
        if (this.currentTemplate === 'elite') {
            const educationContainer = document.querySelector('.elite-section:nth-child(3)');
            if (educationContainer) {
                const newSection = document.createElement('div');
                newSection.className = 'elite-education-item';
                newSection.innerHTML = `
                    <div class="elite-degree" contenteditable="true">Degree</div>
                    <div class="elite-institution" contenteditable="true">Institution Name</div>
                    <div class="elite-education-details">
                        <div class="elite-education-detail">
                            <i class="fas fa-calendar"></i>
                            <span contenteditable="true">Year - Year</span>
                        </div>
                        <div class="elite-education-detail">
                            <i class="fas fa-award"></i>
                            <span contenteditable="true">Honors/Awards</span>
                        </div>
                    </div>
                `;
                educationContainer.appendChild(newSection);
                this.showToast('New education section added', 'success', 'Section added');
            }
        } else {
            let educationContainer = document.getElementById('educationContainer');
            if (!educationContainer) {
                educationContainer = document.querySelector('[id*="education"], .section-content');
            }
            
            if (educationContainer) {
                const newSection = document.createElement('div');
                newSection.className = 'timeline-item';
                newSection.innerHTML = `
                    <div class="item-header">
                        <div>
                            <div class="item-title" contenteditable="true">Degree</div>
                            <div class="item-subtitle" contenteditable="true">Institution Name</div>
                        </div>
                        <div class="item-date" contenteditable="true">Year - Year</div>
                    </div>
                `;
                educationContainer.appendChild(newSection);
                this.showToast('New education section added', 'success', 'Section added');
            }
        }
    }

    addSkillSection() {
        if (this.currentTemplate === 'elite') {
            const firstSkillList = document.querySelector('.elite-skill-list');
            if (firstSkillList) {
                const newSkill = document.createElement('span');
                newSkill.className = 'elite-skill-tag';
                newSkill.setAttribute('contenteditable', 'true');
                newSkill.textContent = 'New Skill';
                firstSkillList.appendChild(newSkill);
                this.showToast('New skill added', 'success', 'Skill added');
            }
        } else {
            let skillsGrid = document.getElementById('skillsContainer');
            if (!skillsGrid) {
                skillsGrid = document.querySelector('.skills-grid');
            }
            
            if (skillsGrid) {
                const skillItem = document.createElement('div');
                skillItem.className = 'skill-item';
                skillItem.innerHTML = `
                    <div class="skill-name" contenteditable="true">New Skill</div>
                    <div class="skill-bar">
                        <div class="skill-progress" style="width: 70%"></div>
                    </div>
                `;
                skillsGrid.appendChild(skillItem);
                this.showToast('New skill added', 'success', 'Skill added');
            }
        }
    }

    // ===== NOTIFICATION SYSTEM =====
    showToast(message, type = 'success', title = '', duration = 5000) {
        if (!this.elements.toastContainer) return;
        
        const toastId = 'toast-' + Date.now();
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.id = toastId;
        
        const icons = {
            success: 'fa-check-circle',
            warning: 'fa-exclamation-triangle',
            error: 'fa-times-circle'
        };
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${icons[type]}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title || type.charAt(0).toUpperCase() + type.slice(1)}</div>
                <div class="toast-message">${this.escapeHtml(message)}</div>
            </div>
            <button class="toast-close" onclick="cvBuilder.closeToast('${toastId}')">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        this.elements.toastContainer.appendChild(toast);
        
        setTimeout(() => {
            this.closeToast(toastId);
        }, duration);
    }

    closeToast(toastId) {
        const toast = document.getElementById(toastId);
        if (toast) {
            toast.classList.add('hide');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ===== MOBILE FEATURES =====
    initMobileFeatures() {
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
        
        if (this.isMobile) {
            document.body.classList.add('mobile-device');
            
            // Prevent zoom on double tap
            let lastTouchEnd = 0;
            document.addEventListener('touchend', (e) => {
                const now = Date.now();
                if (now - lastTouchEnd <= 300) {
                    e.preventDefault();
                }
                lastTouchEnd = now;
            }, false);
        }
    }

    showMobileTips() {
        if (this.elements.mobileTips) {
            this.elements.mobileTips.style.display = 'flex';
        }
    }

    closeMobileTips() {
        if (this.elements.mobileTips) {
            this.elements.mobileTips.style.display = 'none';
        }
    }

    toggleMobileFab() {
        if (!this.elements.mobileFab || !this.elements.mobileMenu) return;
        
        const icon = document.getElementById('fabIcon');
        
        if (this.fabMenuOpen) {
            this.elements.mobileFab.style.background = 'var(--primary)';
            icon.className = 'fas fa-plus';
            this.elements.mobileMenu.style.display = 'none';
            this.fabMenuOpen = false;
        } else {
            this.elements.mobileFab.style.background = 'var(--danger)';
            icon.className = 'fas fa-times';
            this.elements.mobileMenu.style.display = 'flex';
            this.fabMenuOpen = true;
        }
    }

    closeMobileMenu() {
        if (this.elements.mobileMenu) {
            this.elements.mobileMenu.style.display = 'none';
        }
        
        if (this.elements.mobileFab) {
            this.elements.mobileFab.style.background = 'var(--primary)';
        }
        
        const icon = document.getElementById('fabIcon');
        if (icon) {
            icon.className = 'fas fa-plus';
        }
        
        this.fabMenuOpen = false;
    }

    mobileToolbarAction(action, event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        switch(action) {
            case 'undo':
                this.undo();
                break;
            case 'redo':
                this.redo();
                break;
            case 'save':
                this.saveCV();
                break;
            case 'export':
                this.exportCV();
                break;
            case 'menu':
                this.toggleMobileFab();
                break;
        }
        
        if (event && event.currentTarget) {
            const buttons = document.querySelectorAll('.mobile-toolbar-btn');
            buttons.forEach(btn => btn.classList.remove('active'));
            event.currentTarget.classList.add('active');
            
            setTimeout(() => {
                event.currentTarget.classList.remove('active');
            }, 300);
        }
    }

    handleMobileMenuAction(action) {
        switch(action) {
            case 'add-experience':
                this.addSection('experience');
                this.closeMobileMenu();
                break;
            case 'add-education':
                this.addSection('education');
                this.closeMobileMenu();
                break;
            case 'add-skill':
                this.addSection('skill');
                this.closeMobileMenu();
                break;
            case 'change-template':
                this.changeTemplate();
                this.closeMobileMenu();
                break;
            case 'reset-cv':
                this.resetCV();
                this.closeMobileMenu();
                break;
        }
    }

    handleAction(action) {
        switch(action) {
            case 'add-experience':
                this.addSection('experience');
                break;
            case 'add-education':
                this.addSection('education');
                break;
            case 'add-skill':
                this.addSection('skill');
                break;
        }
    }

    // ===== UTILITY FUNCTIONS =====
    handleKeyboardShortcuts(e) {
        if ((e.ctrlKey || e.metaKey) && !e.altKey) {
            switch(e.key.toLowerCase()) {
                case 's':
                    e.preventDefault();
                    this.saveCV();
                    break;
                case 'z':
                    if (e.shiftKey) {
                        e.preventDefault();
                        this.redo();
                    } else {
                        e.preventDefault();
                        this.undo();
                    }
                    break;
                case 'y':
                    e.preventDefault();
                    this.redo();
                    break;
            }
        }
    }

    handleResize() {
        if (this.elements.cvPaper && window.innerWidth <= 768) {
            this.elements.cvPaper.style.transform = 'scale(0.95)';
            this.elements.cvPaper.style.transformOrigin = 'top center';
        } else if (this.elements.cvPaper) {
            this.elements.cvPaper.style.transform = 'none';
        }
        
        this.isMobile = window.innerWidth <= 768;
        if (this.isMobile) {
            document.body.classList.add('mobile-device');
        } else {
            document.body.classList.remove('mobile-device');
        }
    }

    checkSavedData() {
        setTimeout(() => {
            try {
                const savedData = localStorage.getItem('cvBuilderData');
                if (savedData) {
                    this.showToast('Previous session found. Click "Load Draft" to restore.', 'info', 'Welcome back!');
                }
            } catch (e) {
                console.warn('Could not check for saved data:', e);
            }
        }, 1000);
    }
}

// ===== INITIALIZE APPLICATION =====
let cvBuilder;

document.addEventListener('DOMContentLoaded', () => {
    cvBuilder = new CVBuilder();
});