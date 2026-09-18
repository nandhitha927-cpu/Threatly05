import type { SupportedLang } from "./languages";
import type { ComplaintCategory, Priority, RiskLevel } from "./analyzer";

/**
 * Display-side translation of the engine's English vocabularies — applied at
 * render time so the report speaks the user's selected language. Missing
 * entries fall back to the English key.
 */
export type ReportStrings = {
  categories: Record<ComplaintCategory, string>;
  priorities: Record<Priority, string>;
  riskLevels: Record<RiskLevel, string>;
  sentiments: Record<"Positive" | "Neutral" | "Negative", string>;
  emotions: Record<string, string>;
  resolutions: Record<"Resolved" | "Unresolved" | "Unclear", string>;
  issueLabels: Record<string, string>;
  threatTypes: Record<string, string>;
  techniques: Record<string, string>;
  phrases: {
    noTechniques: string;
    threatVerdictNone: string;
    threatVerdictThreat: (risk: string, score: number) => string;
    seriousness: (p: Priority, money: boolean) => string;
    whatTheySay: (issue: string) => string;
    actionRoute: (cat: string) => string;
    actionNoLinks: string;
    actionNoLinkFollow: string;
  };
  actions: Record<string, string>;
  urgentReasons: Record<string, string>;
  urgentActions: Record<string, string>;
};

const en: ReportStrings = {
  categories: {
    "Payment / Transaction": "Payment / Transaction",
    "Billing Problem": "Billing Problem",
    "Refund Request": "Refund Request",
    "Account / Login": "Account / Login",
    "Product Issue": "Product Issue",
    "Delivery / Shipping": "Delivery / Shipping",
    "Subscription Issue": "Subscription Issue",
    "Technical Problem": "Technical Problem",
    "Service Quality": "Service Quality",
    "Security Concern": "Security Concern",
    Other: "Other",
  },
  priorities: { Low: "Low", Medium: "Medium", High: "High", Critical: "Critical" },
  riskLevels: { Low: "Low", Medium: "Medium", High: "High", Critical: "Critical" },
  sentiments: { Positive: "Positive", Neutral: "Neutral", Negative: "Negative" },
  emotions: {
    Neutral: "Neutral",
    Anger: "Anger",
    Frustration: "Frustration",
    "Fear / Anxiety": "Fear / Anxiety",
    Satisfaction: "Satisfaction",
    Urgency: "Urgency",
    Confusion: "Confusion",
    Disappointment: "Disappointment",
  },
  resolutions: { Resolved: "Resolved", Unresolved: "Unresolved", Unclear: "Unclear" },
  issueLabels: {
    "General Inquiry": "General Inquiry",
    "Duplicate Payment": "Duplicate Payment",
    "Unauthorized Charge": "Unauthorized Charge",
    "Refund Delay": "Refund Delay",
    "Refund Requested": "Refund Requested",
    "Payment Failure": "Payment Failure",
    "Login Failure": "Login Failure",
    "Order Not Received": "Order Not Received",
    "Product Defect": "Product Defect",
    "Account Security": "Account Security",
    "Billing Dispute": "Billing Dispute",
    "Unauthorized Access": "Unauthorized Access",
  },
  threatTypes: {
    "Phishing URL": "Phishing URL",
    "Brand impersonation": "Brand impersonation",
    "Credential harvesting": "Credential harvesting",
    "OTP request": "OTP request",
    "Payment redirection": "Payment redirection",
    "Malicious attachment": "Malicious attachment",
    "Phishing lure": "Phishing lure",
  },
  techniques: {
    "Urgency pressure": "Urgency pressure",
    "Authority impersonation": "Authority impersonation",
    "Credential harvesting": "Credential harvesting",
    "Fear / threat framing": "Fear / threat framing",
    "Payment redirection": "Payment redirection",
    "Too-good-to-be-true": "Too-good-to-be-true",
    "None detected": "None detected",
  },
  phrases: {
    noTechniques: "None detected",
    threatVerdictNone: "No security threat indicators",
    threatVerdictThreat: (risk, score) =>
      `Security threat detected — ${risk} risk (score ${score})`,
    seriousness: (p, money) =>
      p === "Critical"
        ? "Critical — immediate response required"
        : p === "High"
          ? money
            ? "High — money at stake, respond promptly"
            : "High — respond promptly"
          : p === "Medium"
            ? "Medium — handle within normal SLA"
            : "Low — routine inquiry",
    whatTheySay: (issue) => `Reporting ${issue.toLowerCase()}`,
    actionRoute: (cat) => `Route by category "${cat}" and sentiment to the right queue.`,
    actionNoLinks: " Do not follow suspicious links or disclose credentials.",
    actionNoLinkFollow: " Do not allow anyone to follow the referenced link.",
  },
  actions: {
    "Escalate to the security team immediately.":
      "Escalate to the security team immediately.",
    "Do not follow links or disclose credentials/OTP.":
      "Do not follow links or disclose credentials/OTP.",
    "Block the flagged domain and preserve headers for forensics.":
      "Block the flagged domain and preserve headers for forensics.",
    "Notify affected customers through a verified channel.":
      "Notify affected customers through a verified channel.",
    "Review within the hour before any agent replies.":
      "Review within the hour before any agent replies.",
    "Verify the link via threat-intel before responding.":
      "Verify the link via threat-intel before responding.",
    "Multiple social-engineering signals — treat as hostile until proven safe.":
      "Multiple social-engineering signals — treat as hostile until proven safe.",
    "Proceed with standard reply flow, but verify any links or payment requests before action.":
      "Proceed with standard reply flow, but verify any links or payment requests before action.",
    "No security action required. Route by category and sentiment to the right queue.":
      "No security action required. Route by category and sentiment to the right queue.",
  },
  urgentReasons: {
    "Account compromise": "Account compromise",
    "Financial loss": "Financial loss",
    Fraud: "Fraud",
    "Security incident": "Security incident",
    "Threat of legal action": "Threat of legal action",
    "Sensitive data exposure": "Sensitive data exposure",
    "Service outage": "Service outage",
    "Repeated unresolved complaint": "Repeated unresolved complaint",
  },
  urgentActions: {
    "Immediate security investigation — lock affected credentials and audit recent activity.":
      "Immediate security investigation — lock affected credentials and audit recent activity.",
    "Immediate security investigation — freeze related transactions and start the payment-recall process.":
      "Immediate security investigation — freeze related transactions and start the payment-recall process.",
    "Immediate security investigation — escalate to the fraud team and preserve evidence.":
      "Immediate security investigation — escalate to the fraud team and preserve evidence.",
    "Immediate security investigation — involve the incident-response team.":
      "Immediate security investigation — involve the incident-response team.",
    "Route to legal/compliance review before any further reply is sent.":
      "Route to legal/compliance review before any further reply is sent.",
    "Immediate security investigation — assess data-exposure scope and notify the DPO.":
      "Immediate security investigation — assess data-exposure scope and notify the DPO.",
    "Notify the on-call engineering/ops team and confirm incident status before replying.":
      "Notify the on-call engineering/ops team and confirm incident status before replying.",
    "Escalate to a senior agent — repeated unresolved contact is a churn and compliance risk.":
      "Escalate to a senior agent — repeated unresolved contact is a churn and compliance risk.",
  },
};

/** French report vocabulary. */
const fr: ReportStrings = {
  ...en,
  categories: {
    ...en.categories,
    "Payment / Transaction": "Paiement / Transaction",
    "Billing Problem": "Problème de facturation",
    "Refund Request": "Demande de remboursement",
    "Account / Login": "Compte / Connexion",
    "Product Issue": "Problème produit",
    "Delivery / Shipping": "Livraison / Expédition",
    "Subscription Issue": "Problème d'abonnement",
    "Technical Problem": "Problème technique",
    "Service Quality": "Qualité de service",
    "Security Concern": "Problème de sécurité",
    Other: "Autre",
  },
  priorities: { Low: "Faible", Medium: "Moyen", High: "Élevé", Critical: "Critique" },
  riskLevels: { Low: "Faible", Medium: "Moyen", High: "Élevé", Critical: "Critique" },
  sentiments: { Positive: "Positif", Neutral: "Neutre", Negative: "Négatif" },
  emotions: {
    ...en.emotions,
    Anger: "Colère",
    Frustration: "Frustration",
    "Fear / Anxiety": "Peur / Anxiété",
    Satisfaction: "Satisfaction",
    Urgency: "Urgence",
    Confusion: "Confusion",
    Disappointment: "Déception",
  },
  resolutions: { Resolved: "Résolu", Unresolved: "Non résolu", Unclear: "Indéterminé" },
  issueLabels: {
    ...en.issueLabels,
    "General Inquiry": "Demande générale",
    "Duplicate Payment": "Paiement dupliqué",
    "Unauthorized Charge": "Frais non autorisés",
    "Refund Delay": "Retard de remboursement",
    "Refund Requested": "Remboursement demandé",
    "Payment Failure": "Échec de paiement",
    "Login Failure": "Échec de connexion",
    "Order Not Received": "Commande non reçue",
    "Product Defect": "Défaut produit",
    "Account Security": "Sécurité du compte",
    "Billing Dispute": "Litige de facturation",
    "Unauthorized Access": "Accès non autorisé",
  },
  threatTypes: {
    ...en.threatTypes,
    "Phishing URL": "URL de phishing",
    "Brand impersonation": "Usurpation de marque",
    "Credential harvesting": "Vol d'identifiants",
    "OTP request": "Demande d'OTP",
    "Payment redirection": "Redirection de paiement",
    "Malicious attachment": "Pièce jointe malveillante",
    "Phishing lure": "Appât de phishing",
  },
  techniques: {
    ...en.techniques,
    "Urgency pressure": "Pression à l'urgence",
    "Authority impersonation": "Usurpation d'autorité",
    "Credential harvesting": "Vol d'identifiants",
    "Fear / threat framing": "Cadrage peur/menace",
    "Payment redirection": "Redirection de paiement",
    "Too-good-to-be-true": "Trop beau pour être vrai",
    "None detected": "Aucune détectée",
  },
  phrases: {
    noTechniques: "Aucune détectée",
    threatVerdictNone: "Aucun indicateur de menace de sécurité",
    threatVerdictThreat: (risk, score) =>
      `Menace de sécurité détectée — risque ${risk} (score ${score})`,
    seriousness: (p, money) =>
      p === "Critical"
        ? "Critique — réponse immédiate requise"
        : p === "High"
          ? money
            ? "Élevé — argent en jeu, répondez rapidement"
            : "Élevé — répondez rapidement"
          : p === "Medium"
            ? "Moyen — à traiter dans le SLA normal"
            : "Faible — demande de routine",
    whatTheySay: (issue) => `Signale ${issue.toLowerCase()}`,
    actionRoute: (cat) => `Acheminer par catégorie "${cat}" et sentiment vers la bonne file.`,
    actionNoLinks: " Ne suivez pas les liens suspects ni ne divulguez d'identifiants.",
    actionNoLinkFollow: " N'autorisez personne à suivre le lien mentionné.",
  },
  actions: {
    ...en.actions,
    "Escalate to the security team immediately.": "Escaladez immédiatement à l'équipe de sécurité.",
    "Do not follow links or disclose credentials/OTP.": "Ne suivez pas les liens ni ne divulguez d'identifiants/OTP.",
    "Block the flagged domain and preserve headers for forensics.": "Bloquez le domaine signalé et conservez les en-têtes pour l'analyse.",
    "Notify affected customers through a verified channel.": "Informez les clients concernés via un canal vérifié.",
    "Review within the hour before any agent replies.": "Examinez dans l'heure avant toute réponse d'agent.",
    "Verify the link via threat-intel before responding.": "Vérifiez le lien via le renseignement sur les menaces avant de répondre.",
    "Multiple social-engineering signals — treat as hostile until proven safe.": "Signaux multiples d'ingénierie sociale — traitez comme hostile jusqu'à preuve du contraire.",
    "Proceed with standard reply flow, but verify any links or payment requests before action.":
      "Suivez le flux de réponse standard, mais vérifiez tout lien ou demande de paiement avant d'agir.",
    "No security action required. Route by category and sentiment to the right queue.":
      "Aucune action de sécurité requise. Acheminez par catégorie et sentiment vers la bonne file.",
  },
  urgentReasons: {
    ...en.urgentReasons,
    "Account compromise": "Compte compromis",
    "Financial loss": "Perte financière",
    Fraud: "Fraude",
    "Security incident": "Incident de sécurité",
    "Threat of legal action": "Menace d'action en justice",
    "Sensitive data exposure": "Exposition de données sensibles",
    "Service outage": "Panne de service",
    "Repeated unresolved complaint": "Plainte répétée non résolue",
  },
  urgentActions: {
    ...en.urgentActions,
    "Immediate security investigation — lock affected credentials and audit recent activity.":
      "Enquête de sécurité immédiate — verrouillez les identifiants concernés et auditez l'activité récente.",
    "Immediate security investigation — freeze related transactions and start the payment-recall process.":
      "Enquête de sécurité immédiate — figez les transactions liées et lancez le rappel de paiement.",
    "Immediate security investigation — escalate to the fraud team and preserve evidence.":
      "Enquête de sécurité immédiate — escaladez à l'équipe fraude et préservez les preuves.",
    "Immediate security investigation — involve the incident-response team.":
      "Enquête de sécurité immédiate — impliquez l'équipe de réponse aux incidents.",
    "Route to legal/compliance review before any further reply is sent.":
      "Transmettez à la revue juridique/conformité avant toute réponse.",
    "Immediate security investigation — assess data-exposure scope and notify the DPO.":
      "Enquête de sécurité immédiate — évaluez la portée de l'exposition des données et notifiez le DPO.",
    "Notify the on-call engineering/ops team and confirm incident status before replying.":
      "Informez l'équipe d'astreinte ing/ops et confirmez le statut de l'incident avant de répondre.",
    "Escalate to a senior agent — repeated unresolved contact is a churn and compliance risk.":
      "Escaladez à un agent sénior — un contact répété non résolu est un risque de churn et de conformité.",
  },
};

/** German report vocabulary. */
const de: ReportStrings = {
  ...en,
  categories: {
    ...en.categories,
    "Payment / Transaction": "Zahlung / Transaktion",
    "Billing Problem": "Abrechnungsproblem",
    "Refund Request": "Rückerstattungsanfrage",
    "Account / Login": "Konto / Anmeldung",
    "Product Issue": "Produktproblem",
    "Delivery / Shipping": "Lieferung / Versand",
    "Subscription Issue": "Abo-Problem",
    "Technical Problem": "Technisches Problem",
    "Service Quality": "Servicequalität",
    "Security Concern": "Sicherheitsbedenken",
    Other: "Sonstiges",
  },
  priorities: { Low: "Niedrig", Medium: "Mittel", High: "Hoch", Critical: "Kritisch" },
  riskLevels: { Low: "Niedrig", Medium: "Mittel", High: "Hoch", Critical: "Kritisch" },
  sentiments: { Positive: "Positiv", Neutral: "Neutral", Negative: "Negativ" },
  emotions: {
    ...en.emotions,
    Anger: "Wut",
    Frustration: "Frust",
    "Fear / Anxiety": "Angst / Unruhe",
    Satisfaction: "Zufriedenheit",
    Urgency: "Dringlichkeit",
    Confusion: "Verwirrung",
    Disappointment: "Enttäuschung",
  },
  resolutions: { Resolved: "Gelöst", Unresolved: "Ungelöst", Unclear: "Unklar" },
  issueLabels: {
    ...en.issueLabels,
    "General Inquiry": "Allgemeine Anfrage",
    "Duplicate Payment": "Doppelte Zahlung",
    "Unauthorized Charge": "Unberechtigte Abbuchung",
    "Refund Delay": "Rückerstattungsverzögerung",
    "Refund Requested": "Rückerstattung angefordert",
    "Payment Failure": "Zahlungsfehler",
    "Login Failure": "Anmeldefehler",
    "Order Not Received": "Bestellung nicht erhalten",
    "Product Defect": "Produktfehler",
    "Account Security": "Kontosicherheit",
    "Billing Dispute": "Abrechnungsstreit",
    "Unauthorized Access": "Unberechtigter Zugriff",
  },
  threatTypes: {
    ...en.threatTypes,
    "Phishing URL": "Phishing-URL",
    "Brand impersonation": "Markenimitation",
    "Credential harvesting": "Zugangsdaten-Abfischerei",
    "OTP request": "OTP-Anfrage",
    "Payment redirection": "Zahlungsumleitung",
    "Malicious attachment": "Bösartiger Anhang",
    "Phishing lure": "Phishing-Köder",
  },
  techniques: {
    ...en.techniques,
    "Urgency pressure": "Dringlichkeitsdruck",
    "Authority impersonation": "Autoritätsimitation",
    "Credential harvesting": "Zugangsdaten-Abfischerei",
    "Fear / threat framing": "Angst-/Bedrohungsrahmung",
    "Payment redirection": "Zahlungsumleitung",
    "Too-good-to-be-true": "Zu gut, um wahr zu sein",
    "None detected": "Keine erkannt",
  },
  phrases: {
    noTechniques: "Keine erkannt",
    threatVerdictNone: "Keine Hinweise auf eine Sicherheitsbedrohung",
    threatVerdictThreat: (risk, score) =>
      `Sicherheitsbedrohung erkannt — Risiko ${risk} (Wert ${score})`,
    seriousness: (p, money) =>
      p === "Critical"
        ? "Kritisch — sofortige Reaktion erforderlich"
        : p === "High"
          ? money
            ? "Hoch — Geld im Spiel, schnell reagieren"
            : "Hoch — schnell reagieren"
          : p === "Medium"
            ? "Mittel — im normalen SLA bearbeiten"
            : "Niedrig — Routineanfrage",
    whatTheySay: (issue) => `Meldet ${issue.toLowerCase()}`,
    actionRoute: (cat) => `Nach Kategorie "${cat}" und Stimmung in die richtige Warteschlange leiten.`,
    actionNoLinks: " Verdächtigen Links nicht folgen und keine Zugangsdaten preisgeben.",
    actionNoLinkFollow: " Niemandem erlauben, dem genannten Link zu folgen.",
  },
  actions: {
    ...en.actions,
    "Escalate to the security team immediately.": "Sofort an das Sicherheitsteam eskalieren.",
    "Do not follow links or disclose credentials/OTP.": "Links nicht folgen und keine Zugangsdaten/OTP preisgeben.",
    "Block the flagged domain and preserve headers for forensics.": "Markierte Domain sperren und Header für forensische Analyse sichern.",
    "Notify affected customers through a verified channel.": "Betroffene Kunden über einen verifizierten Kanal benachrichtigen.",
    "Review within the hour before any agent replies.": "Innerhalb einer Stunde prüfen, bevor ein Agent antwortet.",
    "Verify the link via threat-intel before responding.": "Link vor der Antwort über Threat-Intel prüfen.",
    "Multiple social-engineering signals — treat as hostile until proven safe.": "Mehrere Social-Engineering-Signale — bis zur Prüfung als feindlich behandeln.",
    "Proceed with standard reply flow, but verify any links or payment requests before action.":
      "Standard-Antwortfluss fortsetzen, aber vor dem Handeln alle Links oder Zahlungsanfragen prüfen.",
    "No security action required. Route by category and sentiment to the right queue.":
      "Keine Sicherheitsmaßnahme erforderlich. Nach Kategorie und Stimmung in die richtige Warteschlange leiten.",
  },
  urgentReasons: {
    ...en.urgentReasons,
    "Account compromise": "Konto-Kompromittierung",
    "Financial loss": "Finanzverlust",
    Fraud: "Betrug",
    "Security incident": "Sicherheitsvorfall",
    "Threat of legal action": "Androhung rechtlicher Schritte",
    "Sensitive data exposure": "Offenlegung sensibler Daten",
    "Service outage": "Dienstausfall",
    "Repeated unresolved complaint": "Wiederholt ungelöste Beschwerde",
  },
  urgentActions: {
    ...en.urgentActions,
    "Immediate security investigation — lock affected credentials and audit recent activity.":
      "Sofortige Sicherheitsuntersuchung — betroffene Zugangsdaten sperren und letzte Aktivität prüfen.",
    "Immediate security investigation — freeze related transactions and start the payment-recall process.":
      "Sofortige Sicherheitsuntersuchung — zugehörige Transaktionen einfrieren und Zahlungsrückruf starten.",
    "Immediate security investigation — escalate to the fraud team and preserve evidence.":
      "Sofortige Sicherheitsuntersuchung — an das Betrugsteam eskalieren und Beweise sichern.",
    "Immediate security investigation — involve the incident-response team.":
      "Sofortige Sicherheitsuntersuchung — das Incident-Response-Team einbeziehen.",
    "Route to legal/compliance review before any further reply is sent.":
      "Zur rechtlichen/Compliance-Prüfung weiterleiten, bevor weiter geantwortet wird.",
    "Immediate security investigation — assess data-exposure scope and notify the DPO.":
      "Sofortige Sicherheitsuntersuchung — Umfang der Datenexposition bewerten und DSB benachrichtigen.",
    "Notify the on-call engineering/ops team and confirm incident status before replying.":
      "Bereitschaftsteam (Engineering/Ops) informieren und Incident-Status bestätigen, bevor geantwortet wird.",
    "Escalate to a senior agent — repeated unresolved contact is a churn and compliance risk.":
      "An Senior-Agenten eskalieren — wiederholt ungelöste Kontakte sind ein Churn- und Compliance-Risiko.",
  },
};

/** Portuguese report vocabulary. */
const pt: ReportStrings = {
  ...en,
  categories: {
    ...en.categories,
    "Payment / Transaction": "Pagamento / Transação",
    "Billing Problem": "Problema de faturamento",
    "Refund Request": "Solicitação de reembolso",
    "Account / Login": "Conta / Login",
    "Product Issue": "Problema de produto",
    "Delivery / Shipping": "Entrega / Envio",
    "Subscription Issue": "Problema de assinatura",
    "Technical Problem": "Problema técnico",
    "Service Quality": "Qualidade de serviço",
    "Security Concern": "Preocupação de segurança",
    Other: "Outro",
  },
  priorities: { Low: "Baixo", Medium: "Médio", High: "Alto", Critical: "Crítico" },
  riskLevels: { Low: "Baixo", Medium: "Médio", High: "Alto", Critical: "Crítico" },
  sentiments: { Positive: "Positivo", Neutral: "Neutro", Negative: "Negativo" },
  emotions: {
    ...en.emotions,
    Anger: "Raiva",
    Frustration: "Frustração",
    "Fear / Anxiety": "Medo / Ansiedade",
    Satisfaction: "Satisfação",
    Urgency: "Urgência",
    Confusion: "Confusão",
    Disappointment: "Decepção",
  },
  resolutions: { Resolved: "Resolvido", Unresolved: "Não resolvido", Unclear: "Pouco claro" },
  issueLabels: {
    ...en.issueLabels,
    "General Inquiry": "Consulta geral",
    "Duplicate Payment": "Pagamento duplicado",
    "Unauthorized Charge": "Cobrança não autorizada",
    "Refund Delay": "Atraso de reembolso",
    "Refund Requested": "Reembolso solicitado",
    "Payment Failure": "Falha de pagamento",
    "Login Failure": "Falha de login",
    "Order Not Received": "Pedido não recebido",
    "Product Defect": "Defeito de produto",
    "Account Security": "Segurança da conta",
    "Billing Dispute": "Disputa de faturamento",
    "Unauthorized Access": "Acesso não autorizado",
  },
  threatTypes: {
    ...en.threatTypes,
    "Phishing URL": "URL de phishing",
    "Brand impersonation": "Personificação de marca",
    "Credential harvesting": "Roubo de credenciais",
    "OTP request": "Solicitação de OTP",
    "Payment redirection": "Redirecionamento de pagamento",
    "Malicious attachment": "Anexo malicioso",
    "Phishing lure": "Isca de phishing",
  },
  techniques: {
    ...en.techniques,
    "Urgency pressure": "Pressão de urgência",
    "Authority impersonation": "Personificação de autoridade",
    "Credential harvesting": "Roubo de credenciais",
    "Fear / threat framing": "Enquadramento de medo/ameaça",
    "Payment redirection": "Redirecionamento de pagamento",
    "Too-good-to-be-true": "Bom demais para ser verdade",
    "None detected": "Nenhuma detectada",
  },
  phrases: {
    noTechniques: "Nenhuma detectada",
    threatVerdictNone: "Sem indicadores de ameaça de segurança",
    threatVerdictThreat: (risk, score) =>
      `Ameaça de segurança detectada — risco ${risk} (pontuação ${score})`,
    seriousness: (p, money) =>
      p === "Critical"
        ? "Crítico — resposta imediata necessária"
        : p === "High"
          ? money
            ? "Alto — dinheiro em jogo, responda rapidamente"
            : "Alto — responda rapidamente"
          : p === "Medium"
            ? "Médio — tratar dentro do SLA normal"
            : "Baixo — consulta de rotina",
    whatTheySay: (issue) => `Relata ${issue.toLowerCase()}`,
    actionRoute: (cat) => `Encaminhar por categoria "${cat}" e sentimento para a fila certa.`,
    actionNoLinks: " Não siga links suspeitos nem revele credenciais.",
    actionNoLinkFollow: " Não permita que ninguém siga o link mencionado.",
  },
  actions: {
    ...en.actions,
    "Escalate to the security team immediately.": "Escale imediatamente para a equipe de segurança.",
    "Do not follow links or disclose credentials/OTP.": "Não siga links nem revele credenciais/OTP.",
    "Block the flagged domain and preserve headers for forensics.": "Bloqueie o domínio sinalizado e preserve os cabeçalhos para análise.",
    "Notify affected customers through a verified channel.": "Notifique os clientes afetados por um canal verificado.",
    "Review within the hour before any agent replies.": "Revise dentro de uma hora antes de qualquer resposta do agente.",
    "Verify the link via threat-intel before responding.": "Verifique o link por meio da inteligência de ameaças antes de responder.",
    "Multiple social-engineering signals — treat as hostile until proven safe.": "Múltiplos sinais de engenharia social — trate como hostil até provar o contrário.",
    "Proceed with standard reply flow, but verify any links or payment requests before action.":
      "Prossiga com o fluxo de resposta padrão, mas verifique quaisquer links ou solicitações de pagamento antes de agir.",
    "No security action required. Route by category and sentiment to the right queue.":
      "Nenhuma ação de segurança necessária. Encaminhe por categoria e sentimento para a fila certa.",
  },
  urgentReasons: {
    ...en.urgentReasons,
    "Account compromise": "Conta comprometida",
    "Financial loss": "Perda financeira",
    Fraud: "Fraude",
    "Security incident": "Incidente de segurança",
    "Threat of legal action": "Ameaça de ação judicial",
    "Sensitive data exposure": "Exposição de dados confidenciais",
    "Service outage": "Interrupção de serviço",
    "Repeated unresolved complaint": "Reclamação repetida não resolvida",
  },
  urgentActions: {
    ...en.urgentActions,
    "Immediate security investigation — lock affected credentials and audit recent activity.":
      "Investigação de segurança imediata — bloqueie as credenciais afetadas e audite a atividade recente.",
    "Immediate security investigation — freeze related transactions and start the payment-recall process.":
      "Investigação de segurança imediata — congele as transações relacionadas e inicie o recall do pagamento.",
    "Immediate security investigation — escalate to the fraud team and preserve evidence.":
      "Investigação de segurança imediata — escale para a equipe de fraude e preserve as evidências.",
    "Immediate security investigation — involve the incident-response team.":
      "Investigação de segurança imediata — envolva a equipe de resposta a incidentes.",
    "Route to legal/compliance review before any further reply is sent.":
      "Encaminhe para revisão jurídica/conformidade antes de qualquer resposta.",
    "Immediate security investigation — assess data-exposure scope and notify the DPO.":
      "Investigação de segurança imediata — avalie o escopo da exposição de dados e notifique o DPO.",
    "Notify the on-call engineering/ops team and confirm incident status before replying.":
      "Notifique a equipe de plantão de engenharia/ops e confirme o status do incidente antes de responder.",
    "Escalate to a senior agent — repeated unresolved contact is a churn and compliance risk.":
      "Escale para um agente sênior — contato repetido sem resolução é um risco de churn e conformidade.",
  },
};

/** Hindi report vocabulary. */
const hi: ReportStrings = {
  ...en,
  categories: {
    ...en.categories,
    "Payment / Transaction": "भुगतान / लेन-देन",
    "Billing Problem": "बिलिंग समस्या",
    "Refund Request": "रिफंड अनुरोध",
    "Account / Login": "खाता / लॉगिन",
    "Product Issue": "उत्पाद समस्या",
    "Delivery / Shipping": "डिलीवरी / शिपिंग",
    "Subscription Issue": "सदस्यता समस्या",
    "Technical Problem": "तकनीकी समस्या",
    "Service Quality": "सेवा गुणवत्ता",
    "Security Concern": "सुरक्षा चिंता",
    Other: "अन्य",
  },
  priorities: { Low: "कम", Medium: "मध्यम", High: "उच्च", Critical: "गंभीर" },
  riskLevels: { Low: "कम", Medium: "मध्यम", High: "उच्च", Critical: "गंभीर" },
  sentiments: { Positive: "सकारात्मक", Neutral: "तटस्थ", Negative: "नकारात्मक" },
  emotions: {
    ...en.emotions,
    Neutral: "तटस्थ",
    Anger: "क्रोध",
    Frustration: "निराशा",
    "Fear / Anxiety": "डर / चिंता",
    Satisfaction: "संतुष्टि",
    Urgency: "तात्कालिकता",
    Confusion: "भ्रम",
    Disappointment: "असंतोष",
  },
  resolutions: { Resolved: "हल हो गया", Unresolved: "अनसुलझा", Unclear: "अस्पष्ट" },
  issueLabels: {
    ...en.issueLabels,
    "General Inquiry": "सामान्य पूछताछ",
    "Duplicate Payment": "डुप्लिकेट भुगतान",
    "Unauthorized Charge": "अनधिकृत शुल्क",
    "Refund Delay": "रिफंड में देरी",
    "Refund Requested": "रिफंड का अनुरोध किया",
    "Payment Failure": "भुगतान विफलता",
    "Login Failure": "लॉगिन विफलता",
    "Order Not Received": "ऑर्डर प्राप्त नहीं हुआ",
    "Product Defect": "उत्पाद दोष",
    "Account Security": "खाता सुरक्षा",
    "Billing Dispute": "बिलिंग विवाद",
    "Unauthorized Access": "अनधिकृत पहुंच",
  },
  threatTypes: {
    ...en.threatTypes,
    "Phishing URL": "फ़िशिंग URL",
    "Brand impersonation": "ब्रांड नकली",
    "Credential harvesting": "लॉगिन जानकारी की चोरी",
    "OTP request": "OTP अनुरोध",
    "Payment redirection": "भुगतान पुनर्निर्देशन",
    "Malicious attachment": "दुर्भावनापूर्ण अटैचमेंट",
    "Phishing lure": "फ़िशिंग चारा",
  },
  techniques: {
    ...en.techniques,
    "Urgency pressure": "तात्कालिकता का दबाव",
    "Authority impersonation": "अधिकार की नकल",
    "Credential harvesting": "लॉगिन जानकारी की चोरी",
    "Fear / threat framing": "डर / धमकी की भाषा",
    "Payment redirection": "भुगतान पुनर्निर्देशन",
    "Too-good-to-be-true": "अविश्वसनीय रूप से अच्छा ऑफ़र",
    "None detected": "कोई नहीं मिला",
  },
  phrases: {
    noTechniques: "कोई नहीं मिला",
    threatVerdictNone: "सुरक्षा ख़तरे के कोई संकेत नहीं",
    threatVerdictThreat: (risk, score) =>
      `सुरक्षा ख़तरा पाया गया — ${risk} जोखिम (स्कोर ${score})`,
    seriousness: (p, money) =>
      p === "Critical"
        ? "गंभीर — तुरंत प्रतिक्रिया आवश्यक"
        : p === "High"
          ? money
            ? "उच्च — पैसा दांव पर, शीघ्र जवाब दें"
            : "उच्च — शीघ्र जवाब दें"
          : p === "Medium"
            ? "मध्यम — सामान्य SLA में संभालें"
            : "कम — सामान्य पूछताछ",
    whatTheySay: (issue) => `शिकायत: ${issue}`,
    actionRoute: (cat) => `श्रेणी "${cat}" और भावना के अनुसार सही कतार में भेजें.`,
    actionNoLinks: " संदिग्ध लिंक न खोलें और लॉगिन जानकारी साझा न करें.",
    actionNoLinkFollow: " किसी को भी दिए गए लिंक पर जाने की अनुमति न दें.",
  },
  actions: {
    ...en.actions,
    "Escalate to the security team immediately.": "तुरंत सुरक्षा टीम को भेजें.",
    "Do not follow links or disclose credentials/OTP.": "लिंक न खोलें और लॉगिन जानकारी/OTP साझा न करें.",
    "Block the flagged domain and preserve headers for forensics.": "चिह्नित डोमेन को ब्लॉक करें और जांच के लिए हेडर सुरक्षित रखें.",
    "Notify affected customers through a verified channel.": "प्रभावित ग्राहकों को सत्यापित माध्यम से सूचित करें.",
    "Review within the hour before any agent replies.": "किसी भी एजेंट के जवाब देने से पहले एक घंटे के भीतर समीक्षा करें.",
    "Verify the link via threat-intel before responding.": "जवाब देने से पहले थ्रेट-इंटेल से लिंक सत्यापित करें.",
    "Multiple social-engineering signals — treat as hostile until proven safe.": "कई सोशल-इंजीनियरिंग संकेत — सुरक्षित साबित होने तक शत्रुतापूर्ण मानें.",
    "Proceed with standard reply flow, but verify any links or payment requests before action.":
      "सामान्य जवाब प्रक्रिया जारी रखें, लेकिन कार्रवाई से पहले किसी भी लिंक या भुगतान अनुरोध को सत्यापित करें.",
    "No security action required. Route by category and sentiment to the right queue.":
      "सुरक्षा कार्रवाई आवश्यक नहीं। श्रेणी और भावना के अनुसार सही कतार में भेजें.",
  },
  urgentReasons: {
    ...en.urgentReasons,
    "Account compromise": "खाता समझौता",
    "Financial loss": "वित्तीय नुकसान",
    Fraud: "धोखाधड़ी",
    "Security incident": "सुरक्षा घटना",
    "Threat of legal action": "कानूनी कार्रवाई की धमकी",
    "Sensitive data exposure": "संवेदनशील डेटा का उजागर होना",
    "Service outage": "सेवा में व्यवधान",
    "Repeated unresolved complaint": "बार-बार अनसुलझी शिकायत",
  },
  urgentActions: {
    ...en.urgentActions,
    "Immediate security investigation — lock affected credentials and audit recent activity.":
      "तत्काल सुरक्षा जांच — प्रभावित लॉगिन जानकारी लॉक करें और हालिया गतिविधि की समीक्षा करें.",
    "Immediate security investigation — freeze related transactions and start the payment-recall process.":
      "तत्काल सुरक्षा जांच — संबंधित लेन-देन फ्रीज़ करें और भुगतान रिकॉल प्रक्रिया शुरू करें.",
    "Immediate security investigation — escalate to the fraud team and preserve evidence.":
      "तत्काल सुरक्षा जांच — धोखाधड़ी टीम को भेजें और साक्ष्य सुरक्षित रखें.",
    "Immediate security investigation — involve the incident-response team.":
      "तत्काल सुरक्षा जांच — इंसिडेंट-रिस्पॉन्स टीम को शामिल करें.",
    "Route to legal/compliance review before any further reply is sent.":
      "कोई भी जवाब भेजने से पहले कानूनी/अनुपालन समीक्षा के लिए भेजें.",
    "Immediate security investigation — assess data-exposure scope and notify the DPO.":
      "तत्काल सुरक्षा जांच — डेटा उजागर होने का दायरा आंकें और DPO को सूचित करें.",
    "Notify the on-call engineering/ops team and confirm incident status before replying.":
      "ऑन-कॉल इंजीनियरिंग/ऑप्स टीम को सूचित करें और जवाब देने से पहले घटना की स्थिति की पुष्टि करें.",
    "Escalate to a senior agent — repeated unresolved contact is a churn and compliance risk.":
      "वरिष्ठ एजेंट को भेजें — बार-बार अनसुलझा संपर्क ग्राहक-हानि और अनुपालन जोखिम है.",
  },
};

/** Malayalam report vocabulary. */
const ml: ReportStrings = {
  ...en,
  categories: {
    ...en.categories,
    "Payment / Transaction": "പേയ്മെന്റ് / ഇടപാട്",
    "Billing Problem": "ബില്ലിംഗ് പ്രശ്നം",
    "Refund Request": "റീഫണ്ട് അപേക്ഷ",
    "Account / Login": "അക്കൗണ്ട് / ലോഗിൻ",
    "Product Issue": "ഉൽപ്പന്ന പ്രശ്നം",
    "Delivery / Shipping": "ഡെലിവറി / ഷിപ്പ്മെന്റ്",
    "Subscription Issue": "സബ്സ്ക്രിപ്ഷൻ പ്രശ്നം",
    "Technical Problem": "സാങ്കേതിക പ്രശ്നം",
    "Service Quality": "സേവന നിലവാരം",
    "Security Concern": "സുരക്ഷാ ആശങ്ക",
    Other: "മറ്റുള്ളവ",
  },
  priorities: { Low: "കുറഞ്ഞ", Medium: "ഇടത്തരം", High: "ഉയർന്ന", Critical: "നിർണായക" },
  riskLevels: { Low: "കുറഞ്ഞ", Medium: "ഇടത്തരം", High: "ഉയർന്ന", Critical: "നിർണായക" },
  sentiments: { Positive: "പോസിറ്റീവ്", Neutral: "ന്യൂട്രൽ", Negative: "നെഗറ്റീവ്" },
  emotions: {
    ...en.emotions,
    Neutral: "ന്യൂട്രൽ",
    Anger: "രോഷം",
    Frustration: "വിഷമം",
    "Fear / Anxiety": "ഭയം / ഉത്കണ്ഠ",
    Satisfaction: "സന്തോഷം",
    Urgency: "തിരക്ക്",
    Confusion: "ആശയക്കുഴപ്പം",
    Disappointment: "നിരാശ",
  },
  resolutions: { Resolved: "പരിഹരിച്ചു", Unresolved: "പരിഹരിക്കാത്ത", Unclear: "വ്യക്തമല്ലാത്ത" },
  issueLabels: {
    ...en.issueLabels,
    "General Inquiry": "പൊതു അന്വേഷണം",
    "Duplicate Payment": "ഇരട്ട പേയ്മെന്റ്",
    "Unauthorized Charge": "അനധികൃത ഈടാക്കൽ",
    "Refund Delay": "റീഫണ്ട് വൈകൽ",
    "Refund Requested": "റീഫണ്ട് അപേക്ഷിച്ചു",
    "Payment Failure": "പേയ്മെന്റ് പരാജയം",
    "Login Failure": "ലോഗിൻ പരാജയം",
    "Order Not Received": "ഓർഡർ ലഭിച്ചില്ല",
    "Product Defect": "ഉൽപ്പന്ന വൈകല്യം",
    "Account Security": "അക്കൗണ്ട് സുരക്ഷ",
    "Billing Dispute": "ബില്ലിംഗ് തർക്കം",
    "Unauthorized Access": "അനധികൃത പ്രവേശനം",
  },
  threatTypes: {
    ...en.threatTypes,
    "Phishing URL": "ഫിഷിംഗ് URL",
    "Brand impersonation": "ബ്രാൻഡ് അനുകരണം",
    "Credential harvesting": "ലോഗിൻ വിവരങ്ങൾ ശേഖരിക്കൽ",
    "OTP request": "ഒടിപി അഭ്യർഥന",
    "Payment redirection": "പേയ്മെന്റ് റീഡയറക്ഷൻ",
    "Malicious attachment": "ദ്രോഹ അറ്റാച്ച്മെന്റ്",
    "Phishing lure": "ഫിഷിംഗ് ലൂർ",
  },
  techniques: {
    ...en.techniques,
    "Urgency pressure": "തിരക്ക് സമ്മർദ്ദം",
    "Authority impersonation": "അധികാര അനുകരണം",
    "Credential harvesting": "ലോഗിൻ വിവരങ്ങൾ ശേഖരിക്കൽ",
    "Fear / threat framing": "ഭീഷണി രീതി",
    "Payment redirection": "പേയ്മെന്റ് റീഡയറക്ഷൻ",
    "Too-good-to-be-true": "നടക്കാത്ത വ്യാജ ഓഫർ",
    "None detected": "ഒന്നും കണ്ടെത്തിയില്ല",
  },
  phrases: {
    noTechniques: "ഒന്നും കണ്ടെത്തിയില്ല",
    threatVerdictNone: "സുരക്ഷാ ഭീഷണി സൂചനകളില്ല",
    threatVerdictThreat: (risk, score) =>
      `സുരക്ഷാ ഭീഷണി കണ്ടെത്തി — ${risk} റിസ്ക് (സ്കോർ ${score})`,
    seriousness: (p, money) =>
      p === "Critical"
        ? "നിർണായകം — ഉടനെ പ്രതികരണം ആവശ്യം"
        : p === "High"
          ? money
            ? "ഉയർന്ന — പണം ഉൾപ്പെടുന്നു, ഉടനെ പ്രതികരിക്കുക"
            : "ഉയർന്ന — ഉടനെ പ്രതികരിക്കുക"
          : p === "Medium"
            ? "ഇടത്തരം — സാധാരണ SLA-യിൽ കൈകാര്യം ചെയ്യുക"
            : "കുറഞ്ഞ — പതിവ് അന്വേഷണം",
    whatTheySay: (issue) => `റിപ്പോർട്ട് ചെയ്യുന്നു: ${issue}`,
    actionRoute: (cat) => `വിഭാഗം "${cat}"-ഉം വികാരവും അനുസരിച്ച് ശരിയായ ക്യൂവിലേക്ക് അയക്കുക.`,
    actionNoLinks: " സംശയാസ്പദ ലിങ്കുകൾ പിന്തുടരരുത്; ലോഗിൻ വിവരങ്ങൾ പങ്കിടരുത്.",
    actionNoLinkFollow: " പരാമർശിച്ച ലിങ്കിലേക്ക് ആരെയും പോകാൻ അനുവദിക്കരുത്.",
  },
  actions: {
    ...en.actions,
    "Escalate to the security team immediately.": "ഉടനെ സുരക്ഷാ ടീമിനെ അറിയിക്കുക.",
    "Do not follow links or disclose credentials/OTP.": "ലിങ്കുകൾ പിന്തുടരരുത്; ലോഗിൻ വിവരങ്ങൾ/ഒടിപി പങ്കിടരുത്.",
    "Block the flagged domain and preserve headers for forensics.": "ഫ്ലാഗ് ചെയ്ത ഡൊമെയ്ന് തടയുക; ഫോറൻസിക്കിനായി ഹെഡറുകൾ സൂക്ഷിക്കുക.",
    "Notify affected customers through a verified channel.": "ബാധിത ഉപഭോക്താക്കളെ സ്ഥിരീകരിച്ച ചാനലിലൂടെ അറിയിക്കുക.",
    "Review within the hour before any agent replies.": "ഏജന്റ് മറുപടി നൽകും മുമ്പ് ഒരു മണിക്കൂറിനുള്ളിൽ പരിശോധിക്കുക.",
    "Verify the link via threat-intel before responding.": "മറുപടി നൽകും മുമ്പ് ത്രെറ്റ്-ഇന്റലിലൂടെ ലിങ്ക് പരിശോധിക്കുക.",
    "Multiple social-engineering signals — treat as hostile until proven safe.": "നിരവധി സോഷ്യൽ-എഞ്ചിനീയറിംഗ് സൂചനകൾ — സുരക്ഷിതമെന്ന് തെളിയും വരെ അപകടകരമായി കണക്കാക്കുക.",
    "Proceed with standard reply flow, but verify any links or payment requests before action.":
      "സാധാരണ മറുപടി രീതി തുടരുക, പക്ഷേ നടപടിയെടുക്കും മുമ്പ് ഏതെങ്കിലും ലിങ്കോ പേയ്മെന്റ് അഭ്യർഥനയോ സ്ഥിരീകരിക്കുക.",
    "No security action required. Route by category and sentiment to the right queue.":
      "സുരക്ഷാ നടപടി ആവശ്യമില്ല. വിഭാഗവും വികാരവും അനുസരിച്ച് ശരിയായ ക്യൂവിലേക്ക് അയക്കുക.",
  },
  urgentReasons: {
    ...en.urgentReasons,
    "Account compromise": "അക്കൗണ്ട് അപഹരിക്കപ്പെട്ടു",
    "Financial loss": "സാമ്പത്തിക നഷ്ടം",
    Fraud: "തട്ടിപ്പ്",
    "Security incident": "സുരക്ഷാ സംഭവം",
    "Threat of legal action": "നിയമപരമായ നടപടി ഭീഷണി",
    "Sensitive data exposure": "സെൻസിറ്റീവ് ഡാറ്റ തുറന്നുകാട്ടൽ",
    "Service outage": "സേവന തടസ്സം",
    "Repeated unresolved complaint": "ആവർത്തിക്കുന്ന പരിഹരിക്കാത്ത പരാതി",
  },
  urgentActions: {
    ...en.urgentActions,
    "Immediate security investigation — lock affected credentials and audit recent activity.":
      "ഉടനെ സുരക്ഷാ അന്വേഷണം — ബാധിത ലോഗിൻ വിവരങ്ങൾ ലോക്ക് ചെയ്യുക; സമീപകാല പ്രവർത്തനം പരിശോധിക്കുക.",
    "Immediate security investigation — freeze related transactions and start the payment-recall process.":
      "ഉടനെ സുരക്ഷാ അന്വേഷണം — ബന്ധപ്പെട്ട ഇടപാടുകൾ ഫ്രീസ് ചെയ്യുക; പേയ്മെന്റ് റീകോൾ ആരംഭിക്കുക.",
    "Immediate security investigation — escalate to the fraud team and preserve evidence.":
      "ഉടനെ സുരക്ഷാ അന്വേഷണം — ഫ്രോഡ് ടീമിനെ അറിയിക്കുക; തെളിവുകൾ സൂക്ഷിക്കുക.",
    "Immediate security investigation — involve the incident-response team.":
      "ഉടനെ സുരക്ഷാ അന്വേഷണം — ഇൻസിഡന്റ്-റിസ്പോൺസ് ടീമിനെ ഉൾപ്പെടുത്തുക.",
    "Route to legal/compliance review before any further reply is sent.":
      "കൂടുതൽ മറുപടി നൽകും മുമ്പ് നിയമ/അനുസരണ പരിശോധനയ്ക്ക് അയക്കുക.",
    "Immediate security investigation — assess data-exposure scope and notify the DPO.":
      "ഉടനെ സുരക്ഷാ അന്വേഷണം — ഡാറ്റ തുറന്നുകാട്ടലിന്റെ വ്യാപ്തി വിലയിരുത്തുക; DPO-യെ അറിയിക്കുക.",
    "Notify the on-call engineering/ops team and confirm incident status before replying.":
      "ഓൺ-കോൾ എഞ്ചിനീയറിംഗ്/ഓപ്സ് ടീമിനെ അറിയിക്കുക; മറുപടി നൽകും മുമ്പ് സംഭവ നില സ്ഥിരീകരിക്കുക.",
    "Escalate to a senior agent — repeated unresolved contact is a churn and compliance risk.":
      "സീനിയർ ഏജന്റിനെ അറിയിക്കുക — ആവർത്തിക്കുന്ന പരിഹരിക്കാത്ത ബന്ധപ്പെടൽ ഉപഭോക്തൃ-നഷ്ട അപകടമാണ്.",
  },
};

/** Spanish report vocabulary. */
const es: ReportStrings = {
  ...en,
  categories: {
    ...en.categories,
    "Payment / Transaction": "Pago / Transacción",
    "Billing Problem": "Problema de facturación",
    "Refund Request": "Solicitud de reembolso",
    "Account / Login": "Cuenta / Inicio de sesión",
    "Product Issue": "Problema de producto",
    "Delivery / Shipping": "Entrega / Envío",
    "Subscription Issue": "Problema de suscripción",
    "Technical Problem": "Problema técnico",
    "Service Quality": "Calidad de servicio",
    "Security Concern": "Problema de seguridad",
    Other: "Otro",
  },
  priorities: { Low: "Bajo", Medium: "Medio", High: "Alto", Critical: "Crítico" },
  riskLevels: { Low: "Bajo", Medium: "Medio", High: "Alto", Critical: "Crítico" },
  sentiments: { Positive: "Positivo", Neutral: "Neutral", Negative: "Negativo" },
  emotions: {
    ...en.emotions,
    Neutral: "Neutral",
    Anger: "Enojo",
    Frustration: "Frustración",
    "Fear / Anxiety": "Miedo / Ansiedad",
    Satisfaction: "Satisfacción",
    Urgency: "Urgencia",
    Confusion: "Confusión",
    Disappointment: "Decepción",
  },
  resolutions: { Resolved: "Resuelto", Unresolved: "Sin resolver", Unclear: "Poco claro" },
  issueLabels: {
    ...en.issueLabels,
    "General Inquiry": "Consulta general",
    "Duplicate Payment": "Pago duplicado",
    "Unauthorized Charge": "Cargo no autorizado",
    "Refund Delay": "Retraso de reembolso",
    "Refund Requested": "Reembolso solicitado",
    "Payment Failure": "Fallo de pago",
    "Login Failure": "Fallo de inicio de sesión",
    "Order Not Received": "Pedido no recibido",
    "Product Defect": "Defecto de producto",
    "Account Security": "Seguridad de la cuenta",
    "Billing Dispute": "Disputa de facturación",
    "Unauthorized Access": "Acceso no autorizado",
  },
  threatTypes: {
    ...en.threatTypes,
    "Phishing URL": "URL de phishing",
    "Brand impersonation": "Suplantación de marca",
    "Credential harvesting": "Robo de credenciales",
    "OTP request": "Solicitud de OTP",
    "Payment redirection": "Redirección de pago",
    "Malicious attachment": "Adjunto malicioso",
    "Phishing lure": "Cebo de phishing",
  },
  techniques: {
    ...en.techniques,
    "Urgency pressure": "Presión de urgencia",
    "Authority impersonation": "Suplantación de autoridad",
    "Credential harvesting": "Robo de credenciales",
    "Fear / threat framing": "Enfoque de miedo/amenaza",
    "Payment redirection": "Redirección de pago",
    "Too-good-to-be-true": "Demasiado bueno para ser verdad",
    "None detected": "Ninguna detectada",
  },
  phrases: {
    noTechniques: "Ninguna detectada",
    threatVerdictNone: "Sin indicadores de amenaza de seguridad",
    threatVerdictThreat: (risk, score) =>
      `Amenaza de seguridad detectada — riesgo ${risk} (puntuación ${score})`,
    seriousness: (p, money) =>
      p === "Critical"
        ? "Crítico — respuesta inmediata requerida"
        : p === "High"
          ? money
            ? "Alto — dinero en juego, responda pronto"
            : "Alto — responda pronto"
          : p === "Medium"
            ? "Medio — gestione dentro del SLA normal"
            : "Bajo — consulta de rutina",
    whatTheySay: (issue) => `Reporta ${issue.toLowerCase()}`,
    actionRoute: (cat) => `Enrutar por categoría "${cat}" y sentimiento a la cola correcta.`,
    actionNoLinks: " No siga enlaces sospechosos ni revele credenciales.",
    actionNoLinkFollow: " No permita que nadie siga el enlace mencionado.",
  },
  actions: {
    ...en.actions,
    "Escalate to the security team immediately.": "Escalar al equipo de seguridad de inmediato.",
    "Do not follow links or disclose credentials/OTP.": "No siga enlaces ni revele credenciales/OTP.",
    "Block the flagged domain and preserve headers for forensics.": "Bloquee el dominio marcado y conserve las cabeceras para análisis.",
    "Notify affected customers through a verified channel.": "Notifique a los clientes afectados por un canal verificado.",
    "Review within the hour before any agent replies.": "Revise en menos de una hora antes de que responda cualquier agente.",
    "Verify the link via threat-intel before responding.": "Verifique el enlace con inteligencia de amenazas antes de responder.",
    "Multiple social-engineering signals — treat as hostile until proven safe.": "Múltiples señales de ingeniería social — trátelo como hostil hasta probar lo contrario.",
    "Proceed with standard reply flow, but verify any links or payment requests before action.":
      "Proceda con el flujo de respuesta estándar, pero verifique cualquier enlace o solicitud de pago antes de actuar.",
    "No security action required. Route by category and sentiment to the right queue.":
      "No se requiere acción de seguridad. Enrutar por categoría y sentimiento a la cola correcta.",
  },
  urgentReasons: {
    ...en.urgentReasons,
    "Account compromise": "Cuenta comprometida",
    "Financial loss": "Pérdida financiera",
    Fraud: "Fraude",
    "Security incident": "Incidente de seguridad",
    "Threat of legal action": "Amenaza de acción legal",
    "Sensitive data exposure": "Exposición de datos sensibles",
    "Service outage": "Interrupción del servicio",
    "Repeated unresolved complaint": "Queja repetida sin resolver",
  },
  urgentActions: {
    ...en.urgentActions,
    "Immediate security investigation — lock affected credentials and audit recent activity.":
      "Investigación de seguridad inmediata — bloquee las credenciales afectadas y audite la actividad reciente.",
    "Immediate security investigation — freeze related transactions and start the payment-recall process.":
      "Investigación de seguridad inmediata — congele las transacciones relacionadas e inicie el proceso de recuperación del pago.",
    "Immediate security investigation — escalate to the fraud team and preserve evidence.":
      "Investigación de seguridad inmediata — escale al equipo de fraude y preserve la evidencia.",
    "Immediate security investigation — involve the incident-response team.":
      "Investigación de seguridad inmediata — involucre al equipo de respuesta a incidentes.",
    "Route to legal/compliance review before any further reply is sent.":
      "Pase a revisión legal/cumplimiento antes de enviar cualquier respuesta.",
    "Immediate security investigation — assess data-exposure scope and notify the DPO.":
      "Investigación de seguridad inmediata — evalúe el alcance de la exposición de datos y notifique al DPO.",
    "Notify the on-call engineering/ops team and confirm incident status before replying.":
      "Notifique al equipo de guardia de ingeniería/ops y confirme el estado del incidente antes de responder.",
    "Escalate to a senior agent — repeated unresolved contact is a churn and compliance risk.":
      "Escale a un agente sénior — el contacto repetido sin resolver es un riesgo de abandono y cumplimiento.",
  },
};

export const REPORT_STRINGS: Record<SupportedLang, ReportStrings> = {
  en,
  es,
  fr,
  de,
  pt,
  hi,
  ml,
};

/** Translate an engine English value for display. Falls back to the input. */
export function tr(
  lang: SupportedLang,
  table:
    | "categories"
    | "priorities"
    | "riskLevels"
    | "sentiments"
    | "emotions"
    | "resolutions"
    | "issueLabels"
    | "threatTypes"
    | "techniques"
    | "actions"
    | "urgentReasons"
    | "urgentActions",
  value: string,
): string {
  const tbl = REPORT_STRINGS[lang][table] as Record<string, string> | undefined;
  return tbl?.[value] ?? value;
}

/** Phrase builders for the Combined Intelligence synthesis. */
export function phrases(lang: SupportedLang): ReportStrings["phrases"] {
  return REPORT_STRINGS[lang].phrases;
}
