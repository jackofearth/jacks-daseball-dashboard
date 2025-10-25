# Engineering Doctrine - Baseball Manager Dashboard

## Critical Engineering Principles

### Reference Material Fidelity Protocol
**MANDATORY**: When user provides reference materials (images, examples, specifications), the system MUST actually analyze and use them, not make assumptions or estimates.

- **Verification Requirement**: If user asks "are you using the example image as reference?", the answer must be verifiably true
- **Analysis Over Estimation**: Extract actual coordinates/data from reference materials rather than making educated guesses
- **Evidence-Based Claims**: Only claim to have "analyzed" or "extracted" data when the analysis has actually been performed

### Evidence-Based Debugging Protocol
**CRITICAL**: When user provides corrective feedback indicating systematic failure, treat it as a critical signal requiring fundamental approach change.

- **User Feedback as Critical Signal**: Repeated corrections like "still nowhere close" indicate systematic failure, not minor adjustments needed
- **Root Cause Analysis**: When multiple technical approaches fail, investigate the fundamental data/assumptions rather than switching methods
- **Overconfidence Prevention**: Avoid making definitive claims about analysis or positioning without actual evidence

### Visual Positioning Task Protocol
**SPECIFIC**: For tasks involving text/image positioning on templates, coordinate extraction from reference images is more critical than the technical implementation method.

- **Reference First**: Always extract actual coordinates from reference materials before implementing positioning logic
- **Method Secondary**: Technical implementation (Canvas, HTML, PDF) is secondary to having correct reference coordinates
- **Verification Required**: Test positioning against reference materials to ensure accuracy

## Implementation Standards

### Code Quality
- Maintain clean builds and proper error handling throughout iterations
- Use systematic problem-solving approaches rather than getting stuck on single solutions
- Implement proper console logging for debugging and verification

### User Communication
- Operate autonomously without excessive user consultation
- Only ask for clarification when truly blocked or when user feedback indicates systematic failure
- Provide evidence-based status updates rather than assumptions

---

*This doctrine was established through retrospective analysis of PDF generation positioning challenges and represents critical lessons for future development.*
