import { PlanResponse } from "@/lib/types";

export async function generateTravelPDF(planData: PlanResponse) {
  try {
    const { jsPDF } = await import("jspdf");
    const html2canvas = (await import("html2canvas")).default;
    const { PDFDocument } = await import("pdf-lib");

    // 1. Load cover PDFs
    const coverPdfBytes = await fetch("/pdf/cover.pdf").then((res) =>
      res.arrayBuffer(),
    );
    const coverPdf = await PDFDocument.load(coverPdfBytes);

    // 2. Create main content PDF using canvas approach
    const finalPdf = await PDFDocument.create();

    // Add cover page
    const [coverPage] = await finalPdf.copyPages(coverPdf, [0]);
    finalPdf.addPage(coverPage);

    // 3. Generate content pages one by one
    const contentPages = await generateContentPages(planData);

    for (const pageBlob of contentPages) {
      const pageBytes = await pageBlob.arrayBuffer();
      const pagePdf = await PDFDocument.load(pageBytes);
      const [page] = await finalPdf.copyPages(pagePdf, [0]);
      finalPdf.addPage(page);
    }

    // 4. Save final PDF
    const finalPdfBytes = await finalPdf.save();
    const finalBlob = new Blob([finalPdfBytes], { type: "application/pdf" });

    // Download file
    const url = URL.createObjectURL(finalBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `plan-${planData.plan.days[0].location}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Błąd PDF:", error);
    throw new Error("Nie udało się wygenerować PDF");
  }
}

async function generateContentPages(planData: PlanResponse): Promise<Blob[]> {
  const html2canvas = (await import("html2canvas")).default;
  const { jsPDF } = await import("jspdf");

  const pages: Blob[] = [];

  // Generate day pages
  for (const day of planData.plan.days) {
    const pageElement = createDayPageElement(day);
    document.body.appendChild(pageElement);

    const canvas = await html2canvas(pageElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      width: 794, // A4 width in pixels at 96 DPI
      height: 1123, // A4 height in pixels at 96 DPI
    });

    document.body.removeChild(pageElement);

    const pdf = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    });

    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 0, 0, 210, 297, undefined, "FAST");

    const blob = pdf.output("blob");
    pages.push(blob);
  }

  return pages;
}

function createDayPageElement(day: any): HTMLDivElement {
  const element = document.createElement("div");
  element.style.cssText = `
    width: 794px;
    height: 1123px;
    position: absolute;
    left: -9999px;
    font-family: 'Montserrat', 'Arial', sans-serif;
    color: #333;
    background: #f5f5f5;
    overflow: hidden;
  `;

  element.innerHTML = `
    <!-- Header with image -->
    <div style="
      width: 100%;
      height: 300px;
      background: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url('${day.imageUrl}');
      background-size: cover;
      background-position: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: white;
    ">
      <div style="
        font-size: 40px;
        font-weight: 300;
        text-align: center;
        margin-bottom: 10px;
        border-bottom: 2px solid white;
        padding-bottom: 20px;
        width: 400px;
      ">Dzień ${day.day_number}</div>
      <div style="
        font-size: 40px;
        font-weight: 700;
        text-align: center;
        text-shadow: 2px 2px 8px rgba(0,0,0,0.5);
      ">${day.location}</div>
    </div>

    <!-- Activities timeline -->
    <div style="padding: 40px 60px; background: white; height: 748px; overflow: hidden;">
      ${day.activities
        .map(
          (activity: any, idx: number) => `
        <div style="
          display: flex;
          gap: 30px;
          margin-bottom: ${idx === day.activities.length - 1 ? "0" : "50px"};
        ">
          <div style="flex-shrink: 0; width: 120px; text-align: left;">
            <div style="
              width: 60px;
              height: 60px;
              margin: 0 auto 15px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              ${getActivityIcon(activity.period)}
            </div>
            <div style="
              font-size: 16px;
              font-weight: 700;
              color: #333;
              margin-bottom: 5px;
              text-align: center;
            ">${activity.period}</div>
            <div style="
              font-size: 13px;
              color: #666;
              text-align: center;
            ">${activity.time_range}</div>
          </div>

          <div style="flex: 1; padding-top: 30px;">
            <p style="
              font-size: 15px;
              line-height: 1.8;
              color: #333;
              margin: 0;
            ">${activity.description.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</p>
          </div>
        </div>
      `,
        )
        .join("")}
    </div>

    <!-- Footer -->
    <div style="
      width: 100%;
      height: 75px;
      background: #6FA2C1;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <span style="
        font-size: 18px;
        font-weight: 300;
        color: #ffffff;
        letter-spacing: 3px;
      ">COZOBACZYC.vercel.com</span>
    </div>
  `;

  return element;
}

function getActivityIcon(period: string): string {
  const periodLower = period.toLowerCase();

  if (periodLower.includes("rano") || periodLower.includes("morning")) {
    return `<svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#6FA2C1" stroke-width="1.5" stroke-linecap="round">
      <path d="M7 18a5 5 0 0 1 10 0" /><line x1="12" y1="13" x2="12" y2="10" /><line x1="16.24" y1="14.76" x2="18.36" y2="12.64" /> <line x1="7.76" y1="14.76" x2="5.64" y2="12.64" /><line x1="19" y1="18" x2="22" y2="18" /><line x1="5" y1="18" x2="2" y2="18" /><path d="M2 22h20" />
    </svg>`;
  }

  if (periodLower.includes("popołudnie") || periodLower.includes("afternoon")) {
    return `<svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#6FA2C1" stroke-width="1.5">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41"/>
    </svg>`;
  }

  if (periodLower.includes("wieczór") || periodLower.includes("evening")) {
    return `<svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#6FA2C1" stroke-width="1.5">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>`;
  }

  return `<svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#2196f3" stroke-width="1.5">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
  </svg>`;
}
