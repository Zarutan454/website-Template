# User Stories Integration Rules for Cursor

## Core Rules for User Stories Implementation

### Rule 1: Always Reference User Stories
Before implementing any feature, you MUST:
- Check the relevant user stories in `docs/user-stories/`
- Understand the acceptance criteria
- Review technical requirements
- Identify dependencies
- Plan according to the established patterns

### Rule 2: Follow User Story Format
When creating new user stories, use this exact format:
```
### US-[MODULE]-[NUMBER]: [Title]
**As a** [user type]  
**I want** [feature/functionality]  
**So that** [benefit/value]

**Acceptance Criteria:**
- [Specific, testable criteria]
- [Multiple criteria points]

**Technical Requirements:**
- **Frontend:** [React components, hooks, state management]
- **Backend:** [Django services, API endpoints, business logic]
- **WebSocket:** [Real-time features, connections, events]
- **Redis:** [Caching, session management, data storage]
- **API:** [REST endpoints, authentication, validation]
- **Business Logic:** [Core functionality, algorithms, workflows]

**Dependencies:** [What this story depends on]
**Definition of Done:** [Clear completion criteria]
```

### Rule 3: Implementation Standards
When implementing features:
- Follow the technical requirements exactly as specified
- Implement all acceptance criteria
- Ensure proper error handling
- Add comprehensive testing
- Update documentation
- Consider accessibility (WCAG 2.1 AA)
- Optimize for performance
- Follow security best practices

### Rule 4: Quality Assurance
Before marking any work as complete:
- Verify against all acceptance criteria
- Test all technical requirements
- Ensure dependencies are satisfied
- Validate against definition of done
- Perform code review
- Update user story status

### Rule 5: Documentation Updates
When implementing user stories:
- Update the user story with implementation status
- Document any deviations from requirements
- Add implementation notes
- Update technical documentation
- Maintain traceability

## Module-Specific Implementation Rules

### Social Network Features (Feed, Posts, Comments)
- Implement real-time updates using WebSocket
- Ensure proper content moderation
- Optimize for performance with pagination
- Handle media content properly
- Implement proper error handling

### Blockchain Features (Tokens, NFTs, DAO)
- Follow blockchain security best practices
- Implement proper wallet integration
- Handle gas optimization
- Ensure transaction security
- Implement proper error handling for failed transactions

### Mobile App Features
- Ensure responsive design
- Optimize for mobile performance
- Implement offline functionality
- Handle mobile-specific features
- Ensure cross-platform compatibility

### AI/ML Features
- Implement proper data handling
- Ensure model accuracy
- Handle real-time processing
- Implement fallback mechanisms
- Monitor AI performance

### Analytics Features
- Implement proper data collection
- Ensure data privacy compliance
- Optimize for performance
- Provide meaningful insights
- Handle large datasets efficiently

## Technical Implementation Rules

### Frontend Development
- Use React with TypeScript
- Follow established component patterns
- Implement proper state management
- Ensure responsive design
- Add proper error boundaries
- Implement loading states

### Backend Development
- Use Django with Django REST Framework
- Follow Django best practices
- Implement proper authentication
- Add comprehensive error handling
- Optimize database queries
- Ensure API security

### Real-time Features
- Use WebSocket for real-time communication
- Implement proper connection management
- Handle reconnection scenarios
- Ensure message delivery reliability
- Implement proper event handling

### Caching Strategy
- Use Redis for session management
- Implement intelligent caching
- Handle cache invalidation
- Monitor cache performance
- Implement cache warming

### API Design
- Follow RESTful principles
- Implement proper versioning
- Use consistent error formats
- Implement rate limiting
- Ensure comprehensive documentation

## Quality and Testing Rules

### Code Quality
- Maintain >90% code coverage
- Follow established coding standards
- Implement comprehensive error handling
- Maintain proper documentation
- Follow security best practices

### Testing Requirements
- Unit test all components and services
- Integration test API endpoints
- End-to-end test user journeys
- Test accessibility features
- Performance test under load

### Performance Standards
- <2s page load times
- Optimize bundle size
- Implement lazy loading
- Monitor Core Web Vitals
- Handle high load scenarios

### Security Standards
- Implement proper authentication
- Ensure data encryption
- Follow OWASP guidelines
- Implement input validation
- Regular security audits

## Error Handling Rules

### Frontend Error Handling
- Implement error boundaries
- Show user-friendly messages
- Handle network errors gracefully
- Implement retry mechanisms
- Log errors for debugging

### Backend Error Handling
- Comprehensive error logging
- Proper HTTP status codes
- Meaningful error messages
- Handle edge cases
- Implement proper validation

## Monitoring and Maintenance Rules

### Application Monitoring
- Monitor performance metrics
- Track error rates
- Monitor user experience
- Implement alerting
- Maintain system health

### Code Maintenance
- Keep dependencies updated
- Refactor code regularly
- Remove unused code
- Optimize performance
- Maintain documentation

## Compliance Rules

### Accessibility Compliance
- WCAG 2.1 AA standards
- Screen reader compatibility
- Keyboard navigation
- Color contrast compliance
- Assistive technology support

### Data Privacy
- GDPR compliance
- Data minimization
- User consent management
- Data retention policies
- Privacy by design

## Emergency Procedures

### Critical Issues
- Implement error reporting
- Have rollback procedures
- Maintain backup systems
- Document emergency contacts
- Test disaster recovery

### Security Incidents
- Implement security monitoring
- Have incident response procedures
- Maintain security logs
- Regular security audits
- Update security measures

## Success Metrics

### Quality Metrics
- Code coverage >90%
- Zero critical security vulnerabilities
- <2s page load times
- 99.9% uptime
- Zero accessibility violations

### User Experience Metrics
- User satisfaction scores
- Feature adoption rates
- Performance metrics
- Error rates
- User engagement

## Continuous Improvement

### Regular Reviews
- Review user stories monthly
- Update technical requirements
- Improve implementation patterns
- Optimize performance
- Enhance security measures

### Feedback Integration
- Collect user feedback
- Monitor usage patterns
- Analyze performance data
- Implement improvements
- Update documentation

## Important Reminders

1. **User stories are the source of truth** - always consult them first
2. **Follow established patterns** - don't reinvent the wheel
3. **Maintain quality standards** - never compromise on quality
4. **Update documentation** - keep everything current
5. **Test thoroughly** - quality over speed
6. **Consider accessibility** - make it work for everyone
7. **Monitor performance** - optimize continuously
8. **Follow security practices** - protect user data
9. **Maintain code quality** - write clean, maintainable code
10. **Communicate clearly** - keep stakeholders informed

Remember: The user stories define what needs to be built. Your job is to implement them correctly, efficiently, and with high quality. 