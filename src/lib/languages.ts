/**
 * Multilingual support for the analysis engine.
 *
 * Detects the conversation language (EN, ES, FR, DE, PT, HI) from
 * weighted stopword/function-word markers and Devanagari script, then
 * supplies language-specific lexicons so classification, sentiment,
 * social-engineering detection and resolution tracking work across
 * languages. Structural analysis (URLs, emails, domains, attachments,
 * IP hosts) is language-independent and lives in analyzer.ts.
 */

export type SupportedLang = "en" | "es" | "fr" | "de" | "pt" | "hi" | "ml";

export const LANG_LABELS: Record<SupportedLang, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  pt: "Portuguese",
  hi: "Hindi",
  ml: "Malayalam",
};

// ─── detection ────────────────────────────────────────────────────────────

const SCRIPT_MARKERS: Partial<Record<SupportedLang, RegExp>> = {
  hi: /[\u0900-\u097F]/,
  ml: /[\u0D00-\u0D7F]/,
};

/** Function words / frequent tokens per language (weight = signal strength). */
export const LANG_MARKERS: Record<SupportedLang, [string, number][]> = {
  en: [
    ["the", 2], ["and", 1], ["you", 2], ["your", 2], ["please", 2], ["my", 2],
    ["account", 3], ["payment", 3], ["order", 3], ["refund", 4], ["not", 1],
    ["but", 1], ["for", 1], ["with", 1], ["have", 1], ["this", 1], ["was", 1],
  ],
  es: [
    ["el", 2], ["la", 2], ["los", 1], ["las", 1], ["de", 1], ["que", 2],
    ["por", 1], ["para", 2], ["mi", 2], ["no", 1], ["pero", 2], ["cuenta", 4],
    ["pago", 4], ["pedido", 4], ["reembolso", 5], ["gracias", 2], ["con", 1],
    ["está", 2], ["ha", 1], ["me", 1], ["ayuda", 2], [" facturación", 3],
  ],
  fr: [
    ["le", 2], ["la", 2], ["les", 2], ["des", 1], ["du", 1], ["de", 1],
    ["je", 2], ["j'ai", 3], ["mon", 2], ["ma", 1], ["pas", 2], ["mais", 2], ["pour", 2],
    ["une", 2], ["votre", 3], ["vous", 2], ["être", 2], ["été", 3], ["ici", 2],
    ["compte", 4], ["paiement", 4], ["commande", 4], ["remboursement", 5],
    ["merci", 2], ["avec", 1], ["est", 1], ["problème", 3], [" facturation", 3],
    ["client", 1], ["cher client", 6], ["cliquez", 5], ["activité", 3],
  ],
  de: [
    ["der", 2], ["die", 2], ["das", 2], ["und", 2], ["ich", 2], ["nicht", 2],
    ["aber", 2], ["mit", 1], ["für", 2], ["mein", 2], ["meine", 1], ["ist", 1],
    ["konto", 4], ["zahlung", 4], ["bestellung", 4], ["rückerstattung", 5],
    ["danke", 2], ["bitte", 2], [" problem", 2], [" abrechnung", 3],
  ],
  pt: [
    ["não", 3], ["os ", 1], ["as ", 1], ["que", 2],
    ["mas", 2], ["para", 2], ["minha", 2], ["meu", 2], ["com", 1], ["está", 2],
    ["conta", 4], ["pagamento", 4], ["pedido", 4], ["reembolso", 5],
    ["obrigado", 3], ["problema", 3], [" faturamento", 3], ["encomenda", 5],
  ],
  hi: [
    ["है", 3], ["नहीं", 3], ["मेरा", 3], ["मेरे", 2], ["का", 2], ["की", 2],
    ["को", 2], ["में", 2], ["और", 2], ["कृपया", 3], ["धन्यवाद", 3],
    ["खाता", 5], ["भुगतान", 5], ["आदेश", 4], ["रिफंड", 5], ["समस्या", 4],
    ["शिकायत", 4], [" वापसी", 3],
  ],
  ml: [
    ["എന്റെ", 3], ["വേണം", 3], ["അല്ല", 2], ["ദയവായി", 4], ["നന്ദി", 3],
    ["പ്രശ്നം", 4], ["പരിഹരിക്കുക", 4], ["അക്കൗണ്ട്", 5], ["പേയ്മെന്റ്", 5],
    ["റീഫണ്ട്", 5], ["ലോഗിൻ", 4], ["വിഷമിച്ചു", 3], ["ഉടനെ", 3], ["വേഗത്തിൽ", 2],
  ],
};

/**
 * Detect the language of a support conversation. Falls back to "en"
 * when no language reaches the confidence threshold (short/binary content).
 */
export function detectLanguage(text: string): SupportedLang {
  // script-based detection first (unambiguous for Devanagari)
  for (const [lang, re] of Object.entries(SCRIPT_MARKERS) as [SupportedLang, RegExp][]) {
    const scriptHits = (text.match(new RegExp(re, "g")) ?? []).length;
    if (scriptHits >= Math.min(3, Math.max(1, Math.floor(text.length * 0.02)))) {
      return lang;
    }
  }

  const lower = ` ${text.toLowerCase()} `;
  let best: SupportedLang = "en";
  let bestScore = 0;
  for (const [lang, markers] of Object.entries(LANG_MARKERS) as [SupportedLang, [string, number][]][]) {
    let score = 0;
    for (const [marker, weight] of markers) {
      const m = lower.split(marker).length - 1;
      if (m > 0) score += weight * Math.min(m, 4);
    }
    if (score > bestScore) {
      bestScore = score;
      best = lang;
    }
  }
  return bestScore >= 6 ? best : "en";
}

// ─── language lexicon shape ───────────────────────────────────────────────

export interface LangLexicon {
  /** complaint category keywords → category id (must match analyzer's categories) */
  categories: Partial<Record<
    | "refund" | "billing" | "payment" | "account" | "product" | "delivery"
    | "subscription" | "technical" | "service" | "security",
    string[]
  >>;
  negative: string[];
  positive: string[];
  urgent: string[];
  emotions: Partial<Record<"anger" | "frustration" | "fear" | "satisfaction" | "urgency", string[]>>;
  /** social-engineering technique patterns (translatable cues) */
  se: Partial<Record<"urgency" | "authority" | "credentials" | "fear" | "redirection" | "lure", RegExp[]>>;
  /** phishing lure patterns (translatable cues) */
  phishing: Partial<Record<
    | "dearCustomer" | "unusualActivity" | "verifyAccount" | "paymentUpdate"
    | "clickThrough" | "deadlineThreat",
    RegExp[]
  >>;
  /** credential / OTP request patterns */
  credentialRequest: RegExp[];
  otpRequest: RegExp[];
  /** resolution tracking */
  resolved: RegExp[];
  unresolved: RegExp[];
  /** support-promise language */
  promise: RegExp[];
  /** request-intent patterns for the customer-request summary field */
  requests: RegExp[];
  /** turn labels for conversation splitting ("Cliente:"/"Support:"/"Kunde:") */
  turnLabels: { customer: RegExp; support: RegExp };
}

// ─── per-language lexicons ────────────────────────────────────────────────

export const LEXICONS: Record<SupportedLang, LangLexicon> = {
  en: {
    categories: {},
    negative: [], positive: [], urgent: [], emotions: {}, se: {}, phishing: {},
    credentialRequest: [], otpRequest: [], resolved: [], unresolved: [], promise: [],
    requests: [],
    turnLabels: {
      customer: /^(customer|user|client|kunde)$/i,
      support: /^(support|agent|representative|rep|bot)$/i,
    },
  },
  es: {
    categories: {
      refund: ["reembolso", "devolución del dinero", "reembolsar", "devolver el dinero"],
      billing: ["facturación", "cobro doble", "cobrado dos veces", "cargo duplicado", "factura", "cobro de más"],
      payment: ["el pago falló", "pago rechazado", "tarjeta rechazada", "no se pudo procesar el pago", "fallo de pago"],
      account: ["no puedo iniciar sesión", "acceso a la cuenta", "contraseña", "cuenta bloqueada", "iniciar sesión"],
      product: ["producto defectuoso", "producto dañado", "no funciona", "roto"],
      delivery: ["entrega", "envío", "paquete", "pedido no ha llegado", "retraso en la entrega"],
      subscription: ["suscripción", "renovación automática"],
      technical: ["error", "aplicación se cierra", "fallo técnico", "sitio web no funciona", "pantalla"],
      service: ["servicio al cliente", "atención al cliente", "mala atención"],
      security: ["hackeado", "acceso no autorizado", "fraude", "phishing", "cuenta comprometida"],
    },
    negative: ["terrible", "horrible", "frustrado", "frustrante", "enojado", "furioso", "molesto", "decepcionado", "inaceptable", "pésimo", "mal", "problema", "error", "retraso", "retrasado", "roto", "estafa", "inútil", "peor"],
    positive: ["gracias", "excelente", "genial", "perfecto", "resuelto", "rápido", "amable", "satisfecho", "feliz", "increíble"],
    urgent: ["urgente", "inmediatamente", "lo antes posible", "emergencia", "ahora mismo", "hoy"],
    emotions: {
      anger: ["furioso", "enojado", "indignado", "inaceptable"],
      frustration: ["frustrado", "frustrante", "molesto", "tercera vez", "todavía"],
      fear: ["asustado", "preocupado", "hackeado", "comprometida", "robado"],
      satisfaction: ["gracias", "satisfecho", "resuelto", "excelente"],
      urgency: ["urgente", "inmediatamente", "emergencia"],
    },
    se: {
      urgency: [/(urgente|inmediatamente|actúe ahora|plazo de \d+ (horas|minutos)|expira|último aviso)/i],
      authority: [/(equipo de seguridad|departamento de facturación|departamento de ti|oficial del banco|director de seguridad|verifique su identidad)/i],
      credentials: [/(contraseña|contraseñas|código pin|código de un solo uso|cvv|número de tarjeta|datos de la tarjeta|tarjeta de crédito)/i],
      fear: [/(cuenta (será|sera)? ?(cerrada|bloqueada|suspendida)|acciones legales|demanda|desactivar)/i],
      redirection: [/(transferencia|tarjetas de regalo|criptomoneda|envíe dinero)/i],
      lure: [/(usted ha ganado|premio exclusivo|oferta por tiempo limitado|reclame su premio|regalo gratis)/i],
    },
    phishing: {
      dearCustomer: [/estimado\s+(cliente|usuario)/i],
      unusualActivity: [/(actividad|inicio de sesión|transacción|intento) (inusual|sospechoso|sospechosa)/i],
      verifyAccount: [/(verificar|confirmar|validar|restaurar|asegurar|desbloquear)[^.!?]{0,30}cuenta/i],
      paymentUpdate: [/(actualizar|confirmar|enviar)[^.!?]{0,30}(información|datos) de pago/i],
      clickThrough: [/(haga clic|pulse|abra)[^.!?]{0,20}(aquí|enlace|botón)/i],
      deadlineThreat: [/(dentro de \d+ (horas|minutos)|el acceso será (limitado|restringido)|cuenta será (bloqueada|suspendida))/i],
    },
    credentialRequest: [/(introduzca|proporcione|confirme|comparta)[^.!?]*(contraseña|usuario|pin|tarjeta|credenciales)/i],
    otpRequest: [/(código de verificación|código de un solo uso|otp)/i],
    resolved: [/(resuelto|solucionado|arreglado)/i, /(reembolso|reembolsado) (ha sido|fue) (emitido|procesado)/i, /(funciona de nuevo|todo en orden)/i],
    unresolved: [/(todavía|aún no)/i, /(sin respuesta|nadie ha respondido)/i, /(pendiente|en espera|sin resolver)/i, /(tercera|cuarta) vez/i, /(no (resuelto|recibido|confirmado|llegado))/i, /(cuándo (recibiré|llegará)|dónde está mi (reembolso|pedido))/i],
    promise: [/(estamos revisando|verificando|investigando|escalando)/i, /(le (responderemos|contactaremos)|nos pondremos en contacto)/i, /(espere|un momento)/i, /(lo antes posible|pronto)/i, /(en revisión|escalado al equipo)/i],
    requests: [/quiero (?:que |un |una |mi )?([^.!?]+)/i, /por favor ([^.!?]+)/i, /solicito ([^.!?]+)/i, /necesito ([^.!?]+)/i],
    turnLabels: {
      customer: /^(cliente|usuario)\s*$/i,
      support: /^(soporte|agente|representante|atención al cliente)\s*$/i,
    },
  },
  fr: {
    categories: {
      refund: ["remboursement", "rembourser", "être remboursé", "rendre l'argent"],
      billing: ["facturation", "facturé deux fois", "double prélèvement", "facture", "surfacturé", "montant incorrect"],
      payment: ["paiement refusé", "paiement échoué", "carte refusée", "échec du paiement", "le paiement ne passe pas"],
      account: ["je ne peux pas me connecter", "connexion", "mot de passe", "compte bloqué", "accès au compte"],
      product: ["produit défectueux", "produit endommagé", "ne fonctionne pas", "cassé"],
      delivery: ["livraison", "colis", "commande pas arrivée", "retard de livraison", "expédition"],
      subscription: ["abonnement", "renouvellement automatique"],
      technical: ["erreur", "l'application plante", "panne", "le site ne fonctionne pas", "écran"],
      service: ["service client", "mauvaise assistance", "qualité du service"],
      security: ["piraté", "accès non autorisé", "fraude", "hameçonnage", "compte compromis"],
    },
    negative: ["terrible", "horrible", "frustré", "frustrant", "fâché", "furieux", "déçu", "inacceptable", "mauvais", "problème", "erreur", "retard", "retardé", "cassé", "arnaque", "inutile", "pire"],
    positive: ["merci", "excellent", "génial", "parfait", "résolu", "rapide", "gentil", "satisfait", "heureux", "formidable"],
    urgent: ["urgent", "immédiatement", "dès que possible", "urgence", "tout de suite", "aujourd'hui"],
    emotions: {
      anger: ["furieux", "fâché", "indigné", "inacceptable"],
      frustration: ["frustré", "frustrant", "agacé", "troisième fois", "toujours"],
      fear: ["effrayé", "inquiet", "piraté", "compromis", "volé"],
      satisfaction: ["merci", "satisfait", "résolu", "excellent"],
      urgency: ["urgent", "immédiatement", "urgence"],
    },
    se: {
      urgency: [/(urgent|immédiatement|agissez maintenant|délai de \d+ (heures|minutes)|expire|dernier avertissement)/i],
      authority: [/(équipe de sécurité|service de facturation|service informatique|officiel de la banque|directeur de la sécurité|vérifiez votre identité)/i],
      credentials: [/(mot de passe|code pin|code à usage unique|cvv|numéro de carte|données de carte|carte de crédit)/i],
      fear: [/(compte (sera )?(fermé|bloqué|suspendu)|poursuites judiciaires|procès|désactiver)/i],
      redirection: [/(virement|cartes cadeaux|cryptomonnaie|envoyez de l'argent)/i],
      lure: [/(vous avez gagné|offre exclusive|offre à durée limitée|récupérez votre prix|cadeau gratuit)/i],
    },
    phishing: {
      dearCustomer: [/cher\s+(client|utilisateur)|chère\s+(cliente|utilisatrice)/i],
      unusualActivity: [/(activité|connexion|transaction|tentative) (inhabituelle|suspecte)/i],
      verifyAccount: [/(vérifier|confirmer|valider|restaurer|sécuriser|débloquer)[^.!?]{0,30}compte/i],
      paymentUpdate: [/(mettre à jour|confirmer|soumettre)[^.!?]{0,30}(informations de paiement|détails de facturation)/i],
      clickThrough: [/(cliquez|appuyez|ouvrez)[^.!?]{0,20}(ici|sur le lien|bouton)/i],
      deadlineThreat: [/(dans \d+ (heures|minutes)|l'accès sera (limité|restreint)|compte sera (bloqué|suspendu))/i],
    },
    credentialRequest: [/(saisissez|fournissez|confirmez|partagez)[^.!?]*(mot de passe|identifiant|pin|carte|identifiants)/i],
    otpRequest: [/(code de vérification|code à usage unique|otp)/i],
    resolved: [/(résolu|corrigé|réparé)/i, /(remboursement (a été|a été) (émis|traité))/i, /(fonctionne à nouveau|tout est bon)/i],
    unresolved: [/(toujours|pas encore)/i, /(sans réponse|personne n'a répondu)/i, /(en attente|non résolu)/i, /(troisième|quatrième) fois/i, /(pas (résolu|reçu|confirmé|arrivé))/i, /(quand (vais-je recevoir|arrivera)|où est mon (remboursement|colis))/i],
    promise: [/(nous vérifions|en train d'examiner|investiguons|escaladons)/i, /(nous vous (recontactons|répondrons)|revenir vers vous)/i, /(veuillez patienter|un instant)/i, /(dès que possible|bientôt)/i, /(en cours d'examen|escaladé à l'équipe)/i],
    requests: [/je (voudrais|veux|dois) (?:un |une |mon |ma )?([^.!?]+)/i, /merci de ([^.!?]+)/i, /veuillez ([^.!?]+)/i, /j'ai besoin de ([^.!?]+)/i],
    turnLabels: {
      customer: /^(client|utilisateur)\s*$/i,
      support: /^(assistance|support|agent|représentant)\s*$/i,
    },
  },
  de: {
    categories: {
      refund: ["rückerstattung", "erstatten", "geld zurück", "zurückerstatten"],
      billing: ["abrechnung", "doppelt abgebucht", "doppelte abbuchung", "rechnung", "zu viel berechnet", "falscher betrag"],
      payment: ["zahlung fehlgeschlagen", "zahlung abgelehnt", "karte abgelehnt", "zahlungsfehler", "zahlung ging nicht durch"],
      account: ["kann mich nicht anmelden", "anmeldung", "passwort", "konto gesperrt", "kontozugriff"],
      product: ["defektes produkt", "beschädigtes produkt", "funktioniert nicht", "kaputt"],
      delivery: ["lieferung", "paket", "bestellung nicht angekommen", "lieferverzögerung", "versand"],
      subscription: ["abonnement", "automatische verlängerung"],
      technical: ["fehler", "app stürzt ab", "technisches problem", "webseite funktioniert nicht", "bildschirm"],
      service: ["kundendienst", "schlechter service", "servicequalität"],
      security: ["gehackt", "unbefugter zugriff", "betrug", "phishing", "konto kompromittiert"],
    },
    negative: ["schrecklich", "furchtbar", "frustriert", "frustrierend", "verärgert", "wütend", "enttäuscht", "inakzeptabel", "schlecht", "problem", "fehler", "verzögerung", "verzögert", "kaputt", "betrug", "nutzlos", "schlimmste"],
    positive: ["danke", "ausgezeichnet", "toll", "perfekt", "gelöst", "schnell", "freundlich", "zufrieden", "glücklich", "wunderbar"],
    urgent: ["dringend", "sofort", "so schnell wie möglich", "notfall", "genau jetzt", "heute"],
    emotions: {
      anger: ["wütend", "verärgert", "empört", "inakzeptabel"],
      frustration: ["frustriert", "frustrierend", "genervt", "dritte mal", "immer noch"],
      fear: ["ängstlich", "besorgt", "gehackt", "kompromittiert", "gestohlen"],
      satisfaction: ["danke", "zufrieden", "gelöst", "ausgezeichnet"],
      urgency: ["dringend", "sofort", "notfall"],
    },
    se: {
      urgency: [/(dringend|sofort|jetzt handeln|frist von \d+ (stunden|minuten)|läuft ab|letzte warnung)/i],
      authority: [/(sicherheitsteam|abrechnungsabteilung|it-abteilung|bankoffizieller|sicherheitsdirektor|identität bestätigen)/i],
      credentials: [/(passwort|pin|einmalcode|cvv|kartennummer|kartendaten|kreditkarte)/i],
      fear: [/(konto (wird|ist) (gesperrt|geschlossen|eingeschränkt)|rechtliche schritte|klage|deaktivieren)/i],
      redirection: [/(überweisung|geschenkkarten|kryptowährung|geld senden)/i],
      lure: [/(sie haben gewonnen|exklusives angebot|zeitlich begrenztes angebot|preis abholen|geschenk gratis)/i],
    },
    phishing: {
      dearCustomer: [/(lieber|liebe)\s+(kunde|kundin|nutzer|benutzer)/i],
      unusualActivity: [/(ungewöhnliche|verdächtige) (aktivität|anmeldung|transaktion)/i],
      verifyAccount: [/(überprüfen|bestätigen|validieren|wiederherstellen|sichern|entsperren)[^.!?]{0,30}konto/i],
      paymentUpdate: [/(aktualisieren|bestätigen|übermitteln)[^.!?]{0,30}(zahlungsinformationen|rechnungsdaten)/i],
      clickThrough: [/(klicken|tippen|öffnen)[^.!?]{0,20}(hier|auf den link|schaltfläche)/i],
      deadlineThreat: [/(innerhalb von \d+ (stunden|minuten)|zugriff wird (eingeschränkt|beschränkt)|konto wird (gesperrt|eingefroren))/i],
    },
    credentialRequest: [/(geben Sie|teilen Sie|bestätigen Sie)[^.!?]*(passwort|benutzername|pin|karte|zugangsdaten)/i],
    otpRequest: [/(bestätigungscode|einmalcode|otp)/i],
    resolved: [/(gelöst|behoben|repariert)/i, /(rückerstattung (wurde|ist) (veranlasst|bearbeitet))/i, /(funktioniert wieder|alles gut)/i],
    unresolved: [/(immer noch|bis jetzt nicht)/i, /(keine antwort|niemand hat geantwortet)/i, /(pending|ausstehend|unerledigt)/i, /(dritte|vierte) mal/i, /(nicht (gelöst|erhalten|bestätigt|angekommen))/i, /(wann (bekomme|kommt)|wo ist meine (rückerstattung|bestellung))/i],
    promise: [/(wir prüfen|überprüfen|untersuchen|eskalieren)/i, /(wir melden uns|antworten Ihnen)/i, /(bitte warten|einen moment)/i, /(so schnell wie möglich|bald)/i, /(in prüfung|an das team eskaliert)/i],
    requests: [/ich (möchte|will|brauche) (?:eine |einen |mein |meine )?([^.!?]+)/i, /bitte ([^.!?]+)/i, /ich bitte um ([^.!?]+)/i],
    turnLabels: {
      customer: /^(kunde|kundin|nutzer|benutzer)\s*$/i,
      support: /^(support|kundendienst|agent|mitarbeiter)\s*$/i,
    },
  },
  pt: {
    categories: {
      refund: ["reembolso", "reembolsar", "devolver o dinheiro", "estorno"],
      billing: ["faturamento", "cobrado duas vezes", "cobrança duplicada", "fatura", "cobrado a mais", "valor errado"],
      payment: ["pagamento recusado", "pagamento falhou", "cartão recusado", "falha no pagamento", "pagamento não passou"],
      account: ["não consigo entrar", "login", "senha", "conta bloqueada", "acesso à conta"],
      product: ["produto com defeito", "produto danificado", "não funciona", "quebrado"],
      delivery: ["entrega", "pacote", "pedido não chegou", "atraso na entrega", "envio"],
      subscription: ["assinatura", "renovação automática"],
      technical: ["erro", "aplicativo trava", "problema técnico", "site não funciona", "tela"],
      service: ["atendimento ao cliente", "mau atendimento", "qualidade do serviço"],
      security: ["hackeado", "acesso não autorizado", "fraude", "phishing", "conta comprometida"],
    },
    negative: ["terrível", "horrível", "frustrado", "frustrante", "irritado", "furioso", "decepcionado", "inaceitável", "ruim", "problema", "erro", "atraso", "atrasado", "quebrado", "golpe", "inútil", "pior"],
    positive: ["obrigado", "excelente", "ótimo", "perfeito", "resolvido", "rápido", "gentil", "satisfeito", "feliz", "maravilhoso"],
    urgent: ["urgente", "imediatamente", "o mais rápido possível", "emergência", "agora mesmo", "hoje"],
    emotions: {
      anger: ["furioso", "irritado", "indignado", "inaceitável"],
      frustration: ["frustrado", "frustrante", "irritado", "terceira vez", "ainda"],
      fear: ["com medo", "preocupado", "hackeado", "comprometida", "roubado"],
      satisfaction: ["obrigado", "satisfeito", "resolvido", "excelente"],
      urgency: ["urgente", "imediatamente", "emergência"],
    },
    se: {
      urgency: [/(urgente|imediatamente|aja agora|prazo de \d+ (horas|minutos)|expira|último aviso)/i],
      authority: [/(equipe de segurança|departamento de cobrança|departamento de ti|oficial do banco|diretor de segurança|verifique sua identidade)/i],
      credentials: [/(senha|pin|código único|cvv|número do cartão|dados do cartão|cartão de crédito)/i],
      fear: [/(conta (será )?(fechada|bloqueada|suspensa)|ações legais|processo|desativar)/i],
      redirection: [/(transferência|cartões-presente|criptomoeda|envie dinheiro)/i],
      lure: [/(você ganhou|oferta exclusiva|oferta por tempo limitado|resgate seu prêmio|presente grátis)/i],
    },
    phishing: {
      dearCustomer: [/caro\s+(cliente|usuário)|cara\s+(cliente|usuária)/i],
      unusualActivity: [/(atividade|login|transação|tentativa) (incomum|suspeita|suspeito)/i],
      verifyAccount: [/(verificar|confirmar|validar|restaurar|proteger|desbloquear)[^.!?]{0,30}conta/i],
      paymentUpdate: [/(atualizar|confirmar|enviar)[^.!?]{0,30}(informações de pagamento|dados de cobrança)/i],
      clickThrough: [/(clique|toque|abra)[^.!?]{0,20}(aqui|no link|botão)/i],
      deadlineThreat: [/(em \d+ (horas|minutos)|o acesso será (limitado|restrito)|conta será (bloqueada|suspensa))/i],
    },
    credentialRequest: [/(digite|forneça|confirme|compartilhe)[^.!?]*(senha|usuário|pin|cartão|credenciais)/i],
    otpRequest: [/(código de verificação|código único|otp)/i],
    resolved: [/(resolvido|corrigido|consertado)/i, /(reembolso (foi|foi) (emitido|processado))/i, /(funcionando de novo|tudo certo)/i],
    unresolved: [/(ainda|ainda não)/i, /(sem resposta|ninguém respondeu)/i, /(pendente|aguardando|não resolvido)/i, /(terceira|quarta) vez/i, /(não (resolvido|recebido|confirmado|chegou))/i, /(quando (receberei|chegará)|onde está meu (reembolso|pedido))/i],
    promise: [/(estamos verificando|analisando|investigando|escalando)/i, /(entraremos em contato|retornaremos)/i, /(aguarde|um momento)/i, /(o mais rápido possível|em breve)/i, /(em análise|escalado para a equipe)/i],
    requests: [/quero (?:que |o |a |meu |minha )?([^.!?]+)/i, /por favor ([^.!?]+)/i, /solicito ([^.!?]+)/i, /preciso de ([^.!?]+)/i],
    turnLabels: {
      customer: /^(cliente|usuário)\s*$/i,
      support: /^(suporte|atendimento|agente|representante)\s*$/i,
    },
  },
  hi: {
    categories: {
      refund: ["रिफंड", "धन वापसी", "वापस करें", "पैसे वापस"],
      billing: ["बिलिंग", "दो बार कटा", "डुप्लिकेट भुगतान", "बिल", "अधिक वसूला", "गलत राशि"],
      payment: ["भुगतान विफल", "भुगतान अस्वीकृत", "कार्ड अस्वीकृत", "भुगतान नहीं हुआ", "ट्रांजैक्शन विफल"],
      account: ["लॉग इन नहीं हो रहा", "लॉगिन समस्या", "पासवर्ड", "खाता बंद", "खाता लॉक"],
      product: ["खराब उत्पाद", "टूटा उत्पाद", "काम नहीं कर रहा", "दोषपूर्ण"],
      delivery: ["डिलीवरी", "पार्सल", "ऑर्डर नहीं आया", "डिलीवरी में देरी", "शिपिंग"],
      subscription: ["सब्सक्रिप्शन", "ऑटो नवीनीकरण"],
      technical: ["त्रुटि", "ऐप क्रैश", "तकनीकी समस्या", "वेबसाइट नहीं चल रही", "स्क्रीन"],
      service: ["ग्राहक सेवा", "खराब सेवा", "सेवा गुणवत्ता"],
      security: ["हैक", "अनधिकृत पहुंच", "धोखाधड़ी", "फ़िशिंग", "खाता समझौता", "खाते तक पहुंच", "अनुमति के बिना", "ट्रांसफर कर दिए"],
    },
    negative: ["बहुत खराब", "भयानक", "निराश", "क्रोधित", "गुस्सा", "अस्वीकार्य", "बुरा", "समस्या", "त्रुटि", "देरी", "देर से", "टूटा", "धोखा", "बेकार", "सबसे खराब"],
    positive: ["धन्यवाद", "शुक्रिया", "उत्कृष्ट", "बढ़िया", "परफेक्ट", "हल हो गया", "तेज़", "संतुष्ट", "खुश", "शानदार"],
    urgent: ["तत्काल", "जल्दी", "अभी", "आपातकाल", "आज ही"],
    emotions: {
      anger: ["गुस्सा", "क्रोधित", "अस्वीकार्य"],
      frustration: ["निराश", "झुंझलाहट", "तीसरी बार", "अभी भी"],
      fear: ["डर", "चिंतित", "हैक", "चोरी"],
      satisfaction: ["धन्यवाद", "संतुष्ट", "हल हो गया", "उत्कृष्ट"],
      urgency: ["तत्काल", "आपातकाल"],
    },
    se: {
      urgency: [/(तत्काल|अभी कार्रवाई करें|\d+ घंटे के भीतर|समाप्त हो रहा|अंतिम चेतावनी)/i],
      authority: [/(सुरक्षा टीम|बिलिंग विभाग|आईटी विभाग|बैंक अधिकारी|सुरक्षा निदेशक|पहचान सत्यापित करें)/i],
      credentials: [/(पासवर्ड|पिन|ओटीपी|सीवीवी|कार्ड नंबर|कार्ड विवरण|क्रेडिट कार्ड)/i],
      fear: [/(खाता (बंद|ब्लॉक|निलंबित)|कानूनी कार्रवाई|अदालत|डिएक्टिवेट)/i],
      redirection: [/(ट्रांसफर|गिफ्ट कार्ड|क्रिप्टो|पैसे भेजें)/i],
      lure: [/(आपने जीता|विशेष ऑफर|सीमित समय ऑफर|पुरस्कार प्राप्त करें|मुफ्त उपहार)/i],
    },
    phishing: {
      dearCustomer: [/प्रिय\s+(ग्राहक|उपयोगकर्ता)/i],
      unusualActivity: [/(असामान्य|संदिग्ध) (गतिविधि|लॉगिन|लेनदेन)/i],
      verifyAccount: [/(सत्यापित|पुष्टि|मान्य|सुरक्षित|अनलॉक)[^.!?]{0,30}खाता/i],
      paymentUpdate: [/(अपडेट|पुष्टि|जमा)[^.!?]{0,30}(भुगतान जानकारी|बिलिंग विवरण)/i],
      clickThrough: [/(क्लिक|टैप|खोलें)[^.!?]{0,20}(यहाँ|लिंक|बटन)/i],
      deadlineThreat: [/(\d+ (घंटे|मिनट) के भीतर|पहुंच (सीमित|प्रतिबंधित) होगी|खाता (ब्लॉक|सस्पेंड) होगा)/i],
    },
    credentialRequest: [/(दर्ज करें|प्रदान करें|पुष्टि करें|साझा करें)[^.!?]*(पासवर्ड|उपयोगकर्ता नाम|पिन|कार्ड|क्रेडेंशियल)/i],
    otpRequest: [/(सत्यापन कोड|ओटीपी|otp)/i],
    resolved: [/(हल हो गया|ठीक हो गया|सुलझ गया)/i, /(रिफंड (जारी|संसाधित) हो गया)/i, /(फिर से काम कर रहा|सब ठीक)/i],
    unresolved: [/(अभी भी|अब तक नहीं)/i, /(कोई जवाब नहीं|किसी ने जवाब नहीं दिया)/i, /(लंबित|इंतज़ार|अनसुलझा)/i, /(तीसरी|चौथी) बार/i, /(नहीं (मिला|हुआ|आया|हल))/i, /(कब मिलेगा|मेरा (रिफंड|ऑर्डर) कहाँ)/i],
    promise: [/(हम जांच रहे|देख रहे|जांच|एस्कलेट)/i, /(वापस संपर्क|जवाब देंगे)/i, /(प्रतीक्षा करें|एक क्षण)/i, /(जल्द ही|जल्द से जल्द)/i, /(समीक्षा में|टीम को एस्कलेट)/i],
    requests: [/मुझे (?:एक |मेरा |मेरी )?([^.!?]+)/i, /कृपया ([^.!?]+)/i, /अनुरोध है ([^.!?]+)/i],
    turnLabels: {
      customer: /^(ग्राहक|उपयोगकर्ता)\s*$/i,
      support: /^(सहायता|सपोर्ट|एजेंट|प्रतिनिधि)\s*$/i,
    },
  },
  ml: {
    categories: {
      refund: ["റീഫണ്ട്", "പണം തിരികെ", "തിരികെ നൽകുക", "പണം തിരികെ നൽകണം"],
      billing: ["ബില്ലിംഗ്", "രണ്ടുതവണ ഈടാക്കി", "ഇരട്ട കണക്ക്", "ബിൽ", "അമിതമായി ഈടാക്കി"],
      payment: ["പേയ്മെന്റ് പരാജയപ്പെട്ടു", "പേയ്മെന്റ് വന്നില്ല", "കാർഡ് റിജക്ടഡ്", "പണമടയ്ക്കാൻ കഴിഞ്ഞില്ല", "പേയ്മെന്റ്"],
      account: ["ലോഗിൻ ചെയ്യാൻ കഴിയുന്നില്ല", "അക്കൗണ്ട്", "ലോഗിൻ", "പാസ്വേഡ്", "അക്കൗണ്ട് ലോക്ക് ആയി"],
      product: ["ഉൽപ്പന്നം തകരാറുള്ള", "ഉൽപ്പന്നം പൊട്ടിയ", "പ്രവർത്തിക്കുന്നില്ല", "തകർന്നു"],
      delivery: ["ഡെലിവറി", "പാക്കേജ്", "കോർട്ടേസി വന്നില്ല", "ഡെലിവറി വൈകി", "കോർട്ടേസി"],
      subscription: ["സബ്സ്ക്രിപ്ഷൻ", "സ്വയമേവ പുതുക്കൽ"],
      technical: ["സാങ്കേതിക പ്രശ്നം", "ആപ്പ് തകരുന്നു", "പിശക്", "വെബ്സൈറ്റ് പ്രവർത്തിക്കുന്നില്ല"],
      service: ["കസ്റ്റമർ സർവീസ്", "സേവന നിലവാരം", "മോശം സേവനം"],
      security: ["ഹാക്ക് ചെയ്തു", "അനധികൃത", "അനുമതിയില്ലാതെ", "വഞ്ചന", "ഫിഷിംഗ്", "അക്കൗണ്ട് അപഹരിച്ചു", "സുരക്ഷ", "മോഷ്ടിച്ചു"],
    },
    negative: ["മോശം", "ദയനീയം", "ക്ഷുഭിച്ചു", "നിരാശ", "അസഹ്യം", "പ്രശ്നം", "പിശക്", "വൈകി", "തകർന്നു", "വഞ്ചന", "ഉപയോഗശൂന്യം", "വിഷമിച്ചു", "അനധികൃത", "അനുമതിയില്ലാതെ", "നഷ്ടപ്പെട്ടു", "ഭയന്നു"],
    positive: ["നന്ദി", "മികച്ച", "പരിഹരിച്ചു", "വേഗത്തിൽ", "സന്തുഷ്ട", "സന്തോഷം", "സൗമ്യത"],
    urgent: ["അത്യാവശ്യം", "ഉടനെ", "എത്രയും പെട്ടെന്ന്", "അടിയന്തരം", "ഇപ്പോൾ തന്നെ", "ഇന്ന്"],
    emotions: {
      anger: ["ക്ഷുഭിച്ചു", "രോഷം", "അസഹ്യം", "അപമാനം"],
      frustration: ["വിഷമിച്ചു", "ക്ഷീണിച്ചു", "മൂന്നാം തവണ", "ഇപ്പോഴും"],
      fear: ["ഭയന്നു", "ആശങ്ക", "ഹാക്ക് ചെയ്തു", "മോഷ്ടിച്ചു", "അപഹരിച്ചു", "അനധികൃത", "അനുമതിയില്ലാതെ"],
      satisfaction: ["നന്ദി", "സന്തുഷ്ട", "പരിഹരിച്ചു", "മികച്ച"],
      urgency: ["അത്യാവശ്യം", "ഉടനെ", "അടിയന്തരം"],
    },
    se: {
      urgency: [/(അത്യാവശ്യം|ഉടനെ|ഇപ്പോൾ തന്നെ|അവസാന അവസരം|കാലഹരണപ്പെടും)/i],
      authority: [/(സുരക്ഷാ ടീം|ബില്ലിംഗ് വിഭാഗം|ഐടി വിഭാഗം|ബാങ്ക് ഉദ്യോഗസ്ഥൻ|സുരക്ഷാ ഡയറക്ടർ|നിങ്ങളുടെ ഐഡന്റിറ്റി സ്ഥിരീകരിക്കുക)/i],
      credentials: [/(പാസ്[്‌]*വേഡ്|പിൻ നമ്പർ|ഒറ്റതവണ കോഡ്|സിവിവി|കാർഡ് നമ്പർ|ബാങ്ക് വിവരങ്ങൾ|otp)/i],
      fear: [/(അക്കൗണ്ട് (ബ്ലോക്ക്|നിർത്തിവയ്ക്കും)|നിരോധിക്കും|നിയമപരമായ നടപടി|കേസ് ഫയൽ)/i],
      redirection: [/(പണം അയക്കുക|ഗിഫ്റ്റ് കാർഡ്|ക്രിപ്റ്റോ|ബാങ്ക് അക്കൗണ്ടിലേക്ക് അയക്കുക)/i],
      lure: [/(നിങ്ങൾ ജയിച്ചു|സമ്മാനം നേടി|സൗജന്യ|പരിമിതകാല ഓഫർ)/i],
    },
    phishing: {
      dearCustomer: [/പ്രിയ\s*(ഉപഭോക്താവ്|കസ്റ്റമർ|ഉപയോക്താവ്)/i],
      unusualActivity: [/(അസാധാരണ|സംശയാസ്പദ)\s*(പ്രവർത്തനം|ലോഗിൻ|ഇടപാട്)/i],
      verifyAccount: [/(സ്ഥിരീകരിക്കുക|പരിശോധിക്കുക|അപ്ഡേറ്റ്|അൺലോക്ക്)[^.!?]{0,30}അക്കൗണ്ട്/i],
      paymentUpdate: [/(പേയ്മെന്റ്|കാർഡ്)[^.!?]{0,25}(വിവരങ്ങൾ|അപ്ഡേറ്റ്|നൽകുക)/i],
      clickThrough: [/(ഇവിടെ ക്ലിക്ക്|ക്ലിക്ക് ചെയ്യുക|ലിങ്ക് തുറക്കുക)/i],
      deadlineThreat: [/(\d+\s*(മണിക്കൂർ|മിനിറ്റ്)|അക്കൗണ്ട് (ബ്ലോക്ക്|നിർത്തിവയ്ക്കും)|ആക്സസ് നഷ്ടപ്പെടും)/i],
    },
    credentialRequest: [/(നൽകുക|പങ്കിടുക|സ്ഥിരീകരിക്കുക|ടൈപ്പ് ചെയ്യുക)[^.!?]*(പാസ്[്‌]*വേഡ്|പിൻ|കാർഡ്|വിവരങ്ങൾ|otp)/i],
    otpRequest: [/(ഒറ്റതവണ കോഡ്|സ്ഥിരീകരണ കോഡ്|ഒടിപി|ഓടിപി|otp)/i],
    resolved: [/(പരിഹരിച്ചു|ശരിയായി|തയ്യാറാക്കി)/i, /(റീഫണ്ട് (നൽകി|പ്രോസസ് ചെയ്തു))/i, /(വീണ്ടും പ്രവർത്തിക്കുന്നു|എല്ലാം ശരി)/i],
    unresolved: [/(ഇപ്പോഴും|ഇതുവരെ ഇല്ല)/i, /(മറുപടി ഇല്ല|ആരും പ്രതികരിച്ചില്ല)/i, /(തീർപ്പാകാത്ത|കാത്തിരിക്കുന്നു)/i, /(മൂന്നാം|നാലാം) തവണ/i, /(ലഭിച്ചില്ല|വന്നില്ല|സ്ഥിരീകരിച്ചില്ല)/i, /(എവിടെയാണ്|എപ്പോൾ ലഭിക്കും)/i],
    promise: [/(പരിശോധിക്കുന്നു|പരിശോധിക്കാൻ|അന്വേഷിക്കുന്നു)/i, /(മറുപടി നൽകും|ബന്ധപ്പെടും)/i, /(കാത്തിരിക്കൂ|ഒരു നിമിഷം)/i, /(എത്രയും പെട്ടെന്ന്|ഉടൻ)/i],
    requests: [/എനിക്ക് ([^.!?]+) വേണം/i, /ദയവായി ([^.!?]+)/i, /ഞാൻ ([^.!?]+) ആവശ്യപ്പെടുന്നു/i],
    turnLabels: {
      customer: /^(ഉപഭോക്താവ്|കസ്റ്റമർ|ഉപയോക്താവ്)\s*$/i,
      support: /^(സഹായം|ഏജന്റ്|പ്രതിനിധി|സപ്പോർട്ട്)\s*$/i,
    },
  },
};

/** languages other than English, for iterating lexicon extras */
export const NON_EN_LANGS: SupportedLang[] = ["es", "fr", "de", "pt", "hi", "ml"];

// ─── user language preference (Settings) ──────────────────────────────────

const PREFERRED_LANG_KEY = "threatly-lang";

/** "auto" = per-message detection; a fixed lang = analyze every message in that language. */
export type LangPref = SupportedLang | "auto";

export function getPreferredLanguage(): LangPref {
  const v = localStorage.getItem(PREFERRED_LANG_KEY);
  return v && (v === "auto" || (LANG_LABELS as Record<string, unknown>)[v])
    ? (v as LangPref)
    : "auto";
}

export function setPreferredLanguage(pref: LangPref): void {
  localStorage.setItem(PREFERRED_LANG_KEY, pref);
}

/** Label for a preference value ("Auto-detect", "English", "हिन्दी"…) */
export function langPrefLabel(pref: LangPref): string {
  return pref === "auto" ? "Auto-detect" : LANG_LABELS[pref];
}
