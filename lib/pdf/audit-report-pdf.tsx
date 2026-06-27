// lib/pdf/audit-report-pdf.tsx
//
// The entire PDF document tree.
// Rendered with @react-pdf/renderer — NOT with react-dom.
// This file must only be imported inside a client component via dynamic()
// or inside a server-side Route Handler.  Never import it at the top level
// of a Server Component, because @react-pdf/renderer is client-only.
//
// All primitives (View, Text, Image, Page, Document, StyleSheet) come from
// @react-pdf/renderer.  No Tailwind, no shadcn, no framer-motion here.

import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Link,
} from "@react-pdf/renderer";
import type { AuditReport } from "@/lib/types/audit-report";
import {
  PDF_COLORS as C,
  PDF_FONTS as F,
  PDF_SIZES as S,
  gradeColor,
  scoreColor,
  priorityColor,
} from "./pdf-tokens";

// ── Stylesheet ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Page
  page: {
    backgroundColor: C.pageBg,
    paddingHorizontal: S.pageMarginH,
    paddingVertical: S.pageMarginV,
    fontFamily: F.base,
    color: C.textPrimary,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: C.divider,
    marginVertical: S.sectionGap * 0.6,
  },

  // Section heading
  sectionHeading: {
    fontSize: S.small,
    fontFamily: F.bold,
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 10,
  },

  // Cards
  card: {
    backgroundColor: C.cardBg,
    borderRadius: S.cardRadius,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: S.cardPad,
  },

  // Grid helpers
  row: { flexDirection: "row" },
  col2: { width: "50%" },
  col3: { width: "33.33%" },

  // Header branding
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.brand,
    marginRight: 6,
  },
  brandText: {
    fontSize: S.small,
    fontFamily: F.bold,
    color: C.brand,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },

  // Overall score ring text
  scoreBig: {
    fontSize: 42,
    fontFamily: F.bold,
    lineHeight: 1,
  },
  gradeBox: {
    width: 36,
    height: 36,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
    marginTop: 4,
  },
  gradeText: {
    fontSize: 20,
    fontFamily: F.bold,
  },

  // Category card
  catCard: {
    backgroundColor: C.cardBg,
    borderRadius: S.cardRadius,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 10,
    margin: 3,
  },
  catLabel: { fontSize: S.body, fontFamily: F.bold, marginBottom: 4 },
  catScore: { fontSize: 18, fontFamily: F.bold },
  catSummary: { fontSize: S.caption, color: C.textSecondary, marginTop: 3, lineHeight: 1.4 },

  // Progress bar
  progressTrack: {
    height: 3,
    backgroundColor: C.cardBorder,
    borderRadius: 2,
    marginVertical: 4,
    overflow: "hidden",
  },
  progressFill: { height: 3, borderRadius: 2 },

  // Recommendation
  recRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: C.divider,
  },
  recDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 3,
    marginRight: 8,
    flexShrink: 0,
  },
  recTitle: { fontSize: S.body, fontFamily: F.bold, marginBottom: 2 },
  recDesc: { fontSize: S.caption, color: C.textSecondary, lineHeight: 1.4 },
  recBadgeRow: { flexDirection: "row", marginTop: 4, gap: 4 },
  recBadge: {
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderWidth: 1,
  },
  recBadgeText: { fontSize: S.caption - 1, fontFamily: F.bold, textTransform: "uppercase" },

  // Screenshot
  screenshotImg: {
    width: "100%",
    borderRadius: S.cardRadius,
    borderWidth: 1,
    borderColor: C.cardBorder,
    objectFit: "cover",
  },

  // Metadata table
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: C.divider,
  },
  metaLabel: { fontSize: S.caption, color: C.textSecondary },
  metaValue: { fontSize: S.caption, fontFamily: F.bold, textAlign: "right", maxWidth: "60%" },

  // Footer
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: S.sectionGap,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: C.divider,
  },
  footerText: { fontSize: S.caption, color: C.textMuted },
});

// ── Helper components ─────────────────────────────────────────────────────────

function Divider() {
  return <View style={styles.divider} />;
}

function SectionHeading({ children }: { children: string }) {
  return <Text style={styles.sectionHeading}>{children}</Text>;
}

function ProgressBar({
  pct,
  color,
}: {
  pct: number;
  color: string;
}) {
  return (
    <View style={styles.progressTrack}>
      <View
        style={[
          styles.progressFill,
          { width: `${Math.min(100, Math.max(0, pct))}%`, backgroundColor: color },
        ]}
      />
    </View>
  );
}

// ── Section: Cover / Header ───────────────────────────────────────────────────

function CoverSection({ report }: { report: AuditReport }) {
  const sc = gradeColor(report.overallGrade);

  return (
    <View>
      {/* Branding */}
      <View style={styles.brandRow}>
        <View style={styles.brandDot} />
        <Text style={styles.brandText}>SiteDoctor AI — Audit Report</Text>
      </View>

      {/* URL */}
      <Text
        style={{
          fontSize: S.title,
          fontFamily: F.bold,
          marginBottom: 4,
          color: C.textPrimary,
        }}
      >
        {(() => {
          try { return new URL(report.url).hostname; } catch { return report.url; }
        })()}
      </Text>

      <Link
        src={report.url}
        style={{ fontSize: S.small, color: C.brand, textDecoration: "underline", marginBottom: 4 }}
      >
        {report.url}
      </Link>

      <Text style={{ fontSize: S.small, color: C.textSecondary }}>
        Generated{" "}
        {new Intl.DateTimeFormat("en-IN", { dateStyle: "long", timeStyle: "short" }).format(
          new Date(report.completedAt),
        )}
      </Text>

      <Divider />

      {/* Score + Grade inline */}
      <View style={[styles.row, { alignItems: "flex-end", marginBottom: S.sectionGap }]}>
        <View>
          <Text style={{ fontSize: S.small, color: C.textSecondary, marginBottom: 4 }}>
            Overall Score
          </Text>
          <View style={[styles.row, { alignItems: "flex-end" }]}>
            <Text style={[styles.scoreBig, { color: sc }]}>{report.overallScore}</Text>
            <Text style={{ fontSize: S.h3, color: C.textMuted, paddingBottom: 6, marginLeft: 4 }}>
              / 100
            </Text>
            <View style={[styles.gradeBox, { backgroundColor: `${sc}20`, borderWidth: 1, borderColor: `${sc}40` }]}>
              <Text style={[styles.gradeText, { color: sc }]}>{report.overallGrade}</Text>
            </View>
          </View>
        </View>

        <View style={{ flex: 1, marginLeft: 24 }}>
          <Text style={{ fontSize: S.body, color: C.textSecondary, lineHeight: 1.5 }}>
            {report.summary}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ── Section: Category Scores ──────────────────────────────────────────────────

function CategorySection({ report }: { report: AuditReport }) {
  const cats = report.categories;

  return (
    <View>
      <SectionHeading>Category Scores</SectionHeading>
      <View style={[styles.row, { flexWrap: "wrap", margin: -3 }]}>
        {cats.map((cat) => {
          const color = gradeColor(cat.grade);
          return (
            <View key={cat.id} style={[styles.catCard, styles.col3]}>
              <View style={[styles.row, { justifyContent: "space-between", alignItems: "center", marginBottom: 2 }]}>
                <Text style={styles.catLabel}>{cat.label}</Text>
                <Text style={{ fontSize: S.body, fontFamily: F.bold, color }}>{cat.grade}</Text>
              </View>
              <ProgressBar pct={cat.score} color={color} />
              <View style={[styles.row, { justifyContent: "space-between", marginTop: 2 }]}>
                <Text style={[styles.catScore, { color }]}>{cat.score}</Text>
                <Text style={{ fontSize: S.caption, color: C.textMuted, alignSelf: "flex-end" }}>/ 100</Text>
              </View>
              <Text style={styles.catSummary}>
  {cat.summary}
</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ── Section: Recommendations ─────────────────────────────────────────────────

function RecommendationsSection({ report }: { report: AuditReport }) {
  const recs = report.recommendations;
  if (!recs.length) return null;

  const grouped = (["high", "medium", "low"] as const).map((p) => ({
    priority: p,
    items: recs.filter((r) => r.priority === p),
  })).filter((g) => g.items.length > 0);

  return (
    <View>
      <SectionHeading>Priority Recommendations</SectionHeading>
      {grouped.map(({ priority, items }) => (
        <View key={priority} style={{ marginBottom: 12 }}>
          {/* Group label */}
          <Text
            style={{
              fontSize: S.caption,
              fontFamily: F.bold,
              textTransform: "uppercase",
              letterSpacing: 1,
              color: priorityColor(priority),
              marginBottom: 4,
            }}
          >
            {priority} priority ({items.length})
          </Text>

          {items.map((rec, i) => {
            const pc = priorityColor(rec.priority);
            const ec = rec.effort === "low"
              ? C.gradeA
              : rec.effort === "medium"
                ? C.gradeC
                : C.gradeF;

            return (
              <View key={rec.id} style={styles.recRow}>
                <View style={[styles.recDot, { backgroundColor: pc }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.recTitle}>{rec.title}</Text>
                  <Text style={styles.recDesc}>
  {rec.description}
</Text>
                  <View style={styles.recBadgeRow}>
                    {/* Impact */}
                    <View style={[styles.recBadge, { borderColor: `${pc}40`, backgroundColor: `${pc}15` }]}>
                      <Text style={[styles.recBadgeText, { color: pc }]}>Impact: {rec.impact}</Text>
                    </View>
                    {/* Effort */}
                    <View style={[styles.recBadge, { borderColor: `${ec}40`, backgroundColor: `${ec}15` }]}>
                      <Text style={[styles.recBadgeText, { color: ec }]}>{rec.effort} effort</Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

// ── Section: Screenshots ─────────────────────────────────────────────────────

function ScreenshotsSection({ report }: { report: AuditReport }) {
  const { desktopUrl, mobileUrl } = report.screenshots;
  const hasDesktop = !!desktopUrl;
  const hasMobile = !!mobileUrl;
  if (!hasDesktop && !hasMobile) return null;

  return (
    <View>
      <SectionHeading>Screenshots</SectionHeading>
      <View style={[styles.row, { gap: 8 }]}>
        {hasDesktop && (
          <View style={[styles.col2, hasMobile ? {} : { width: "100%" }]}>
            <Text style={{ fontSize: S.caption, color: C.textSecondary, marginBottom: 4 }}>
              Desktop
            </Text>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={desktopUrl!} style={styles.screenshotImg} />
          </View>
        )}
        {hasMobile && (
          <View style={[{ width: hasDesktop ? "50%" : "40%" }]}>
            <Text style={{ fontSize: S.caption, color: C.textSecondary, marginBottom: 4 }}>
              Mobile
            </Text>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={mobileUrl!} style={styles.screenshotImg} />
          </View>
        )}
      </View>
    </View>
  );
}

// ── Section: Metadata ─────────────────────────────────────────────────────────

function MetadataSection({ report }: { report: AuditReport }) {
  const meta = report.metadata;
  const rows: Array<{ label: string; value: string }> = [
    { label: "Audit ID", value: report.auditId },
    { label: "Lighthouse", value: meta.lighthouseVersion },
    { label: "Environment", value: meta.environment },
    {
      label: "Fetch time",
      value: new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(
        new Date(meta.fetchTime),
      ),
    },
    {
      label: "Completed",
      value: new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(
        new Date(report.completedAt),
      ),
    },
  ];

  return (
    <View>
      <SectionHeading>Audit Metadata</SectionHeading>
      <View style={styles.card}>
        {rows.map((r) => (
          <View key={r.label} style={styles.metaRow}>
            <Text style={styles.metaLabel}>{r.label}</Text>
            <Text style={styles.metaValue}>{r.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function PdfFooter({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>Generated by SiteDoctor AI</Text>
      <Text style={styles.footerText}>
        Page {pageNumber} of {totalPages}
      </Text>
    </View>
  );
}

// ── Root document ─────────────────────────────────────────────────────────────

interface AuditReportPdfProps {
  report: AuditReport;
}

export function AuditReportPdf({ report }: AuditReportPdfProps) {
  return (
    <Document
      title={`SiteDoctor Audit — ${report.url}`}
      author="SiteDoctor AI"
      subject="Website Audit Report"
      creator="SiteDoctor AI"
      producer="@react-pdf/renderer"
    >
      <Page
        size="A4"
        style={styles.page}
        wrap
      >
        {/* ── Cover + Overall Score ── */}
        <CoverSection report={report} />

        {/* ── Category Scores ── */}
        <CategorySection report={report} />

        <Divider />

        {/* ── Recommendations ── */}
        <RecommendationsSection report={report} />

        <Divider />

        {/* ── Screenshots ── */}
        <ScreenshotsSection report={report} />

        <Divider />

        {/* ── Metadata ── */}
        <MetadataSection report={report} />

        {/* ── Fixed footer with page number ── */}
        <Text
          style={[styles.footerText, {
            position: "absolute",
            bottom: S.pageMarginV - 16,
            left: S.pageMarginH,
          }]}
          fixed
          render={({ pageNumber, totalPages }) =>
            `SiteDoctor AI — Confidential Audit Report   |   Page ${pageNumber} / ${totalPages}`
          }
        />
      </Page>
    </Document>
  );
}
