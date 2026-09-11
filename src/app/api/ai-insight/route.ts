import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Simple fallback analytical engine if GEMINI_API_KEY is missing
function generateLocalInsight(data: any): string {
  const { kpis, taxBreakdown, commodities, countries, enterprises } = data;
  
  const formattedValueUSD = (kpis.totalValueUSD / 1e6).toFixed(2);
  const formattedTaxVND = (kpis.totalTaxVND / 1e12).toFixed(3);
  
  const topComm = commodities && commodities.length > 0 ? commodities[0].name : 'N/A';
  const topCommVal = commodities && commodities.length > 0 ? (commodities[0].valueVND / 1e12).toFixed(2) : '0';
  
  const topPartner = countries && countries.length > 0 ? countries[0].name : 'N/A';
  const topPartnerVal = countries && countries.length > 0 ? (countries[0].valueUSD / 1e6).toFixed(2) : '0';
  
  const topEnt = enterprises && enterprises.length > 0 ? enterprises[0].name : 'N/A';
  
  const thueXNKPct = ((taxBreakdown.thueXNK / kpis.totalTaxVND) * 100).toFixed(1);
  const thueVATPercent = ((taxBreakdown.thueV / kpis.totalTaxVND) * 100).toFixed(1);
  const thueSCTPercent = ((taxBreakdown.thueT / kpis.totalTaxVND) * 100).toFixed(1);

  return `### BÁO CÁO PHÂN TÍCH VÀ NHẬN ĐỊNH HẢI QUAN (PHÂN TÍCH ĐỘC LẬP)

*Dưới đây là nhận định tự động dựa trên số liệu thống kê hiện tại của hệ thống từ ngày đăng ký tờ khai.*

#### 1. Tổng quan hoạt động Xuất Nhập Khẩu
- **Quy mô thương mại:** Tổng kim ngạch đạt **${formattedValueUSD} triệu USD** thông qua **${kpis.totalDeclarations.toLocaleString()} tờ khai** hải quan.
- **Lưu lượng vận tải:** Đạt **${kpis.totalContainers.toLocaleString()} container** với tổng trọng lượng hàng hóa vận chuyển là **${kpis.totalWeightTNE.toLocaleString()} tấn**. Hiệu suất trung bình đạt khoảng ${(kpis.totalWeightTNE / kpis.totalContainers).toFixed(1)} tấn mỗi container, cho thấy mật độ hàng hóa ổn định.

#### 2. Phân tích Cơ cấu Thuế hải quan
Tổng số thuế thu được đạt **${formattedTaxVND} nghìn tỷ VND**. Cơ cấu thuế ghi nhận:
- **Thuế Giá trị gia tăng (VAT):** Chiếm tỷ trọng lớn nhất với **${thueVATPercent}%** tổng thu. Điều này phản ánh xu hướng tiêu thụ nội địa ổn định đối với hàng hóa nhập khẩu.
- **Thuế Xuất Nhập Khẩu:** Đóng góp **${thueXNKPct}%** tổng thu. Đây là chỉ số phản ánh tác động trực tiếp của các hiệp định thương mại tự do (FTA) đang làm giảm dần thuế quan trung bình.
- **Thuế Tiêu thụ đặc biệt (TTĐB):** Chiếm **${thueSCTPercent}%**, chủ yếu tập trung vào các nhóm hàng hạn chế tiêu dùng hoặc có thuế suất cao (như ô tô nguyên chiếc, bia rượu, xăng dầu).
- Các thuế tự vệ và bảo vệ môi trường duy trì ở mức thấp, phản ánh đúng đặc thù ngành hàng nhập khẩu hiện tại.

#### 3. Phân tích Nhóm hàng & Đối tác trọng điểm
- **Nhóm hàng dẫn đầu:** Mặt hàng **"${topComm}"** đóng góp giá trị giao dịch cao nhất đạt khoảng **${topCommVal} nghìn tỷ VND**. Sự tập trung lớn vào nhóm hàng công nghệ/máy móc cho thấy xu hướng hiện đại hóa sản xuất.
- **Thị trường đối tác lớn nhất:** **${topPartner}** tiếp tục là đối tác thương mại số một với kim ngạch **${topPartnerVal} triệu USD**. Doanh nghiệp cần lưu ý đa dạng hóa chuỗi cung ứng để tránh rủi ro tập trung quá mức vào một thị trường.

#### 4. Phân tích Doanh nghiệp & Cảnh báo rủi ro
- Doanh nghiệp đóng góp lớn nhất là **${topEnt}**. 
- **Cảnh báo tính bền vững:** Cơ cấu giá trị XNK và nguồn thu thuế phụ thuộc lớn vào Top 3 doanh nghiệp đầu ngành. Bất kỳ biến động tài chính hoặc thay đổi chính sách đầu tư nào của nhóm này cũng sẽ ảnh hưởng mạnh đến số thu ngân sách của chi cục.

#### 5. Khuyến nghị chính sách hải quan
1. **Tối ưu hóa phân luồng:** Tỉ lệ tờ khai cần luồng xanh nên được duy trì trên 65% thông qua cơ chế tự động hóa đánh giá tuân thủ (AEO) để tăng tốc độ thông quan.
2. **Quản lý rủi ro giá:** Tăng cường kiểm tra sau thông quan đối với nhóm hàng "${topComm}" do có trị giá tính thuế lớn và cơ cấu thuế phức tạp.
3. **Chuyển đổi số:** Khuyến khích các doanh nghiệp phụ trợ chuyển sang nộp thuế điện tử 24/7 để giảm thời gian thông quan container xuống dưới 24 giờ.

---
*(Lưu ý: Để mở khóa nhận định chuyên sâu hơn từ AI Gemini, vui lòng điền khóa API chính xác vào biến môi trường GEMINI_API_KEY)*`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey === '') {
      console.log('No Gemini API Key configured. Returning local insight.');
      const localResult = generateLocalInsight(body);
      return NextResponse.json({ insight: localResult });
    }

    // Initialize Google Generative AI
    const ai = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash as default, fast and accurate
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Bạn là một chuyên gia phân tích dữ liệu Hải quan cấp cao tại Việt Nam. Hãy đọc và phân tích số liệu thống kê hoạt động xuất nhập khẩu bên dưới và viết một báo cáo đánh giá, nhận định kinh tế chuyên sâu bằng tiếng Việt.

Yêu cầu báo cáo:
1. Định dạng Markdown đẹp mắt, có tiêu đề lớn, các tiêu đề phụ rõ ràng.
2. Giọng điệu chuyên nghiệp, sắc sảo của chuyên gia phân tích kinh tế vĩ mô và hải quan.
3. Phải phân tích các chỉ tiêu cụ thể từ số liệu được cung cấp (tránh chung chung):
   - Đánh giá tổng quan quy mô xuất nhập khẩu (tờ khai, trị giá USD, số lượng container, trọng lượng).
   - Đánh giá chi tiết cơ cấu thuế hải quan (phân tích sự phân bổ của thuế XNK, thuế VAT, thuế tiêu thụ đặc biệt TTĐB, thuế bảo vệ môi trường BVMT, thuế tự vệ B, thuế khác). Hãy tính toán tỷ lệ đóng góp của từng loại thuế.
   - Nhận định về nhóm hàng hàng đầu và đối tác thương mại chính. Đánh giá thế mạnh và rủi ro (ví dụ sự phụ thuộc vào một thị trường hoặc một nhóm hàng).
   - Đánh giá tầm ảnh hưởng của các doanh nghiệp lớn nhất (sự tập trung kim ngạch).
   - Đưa ra 3-4 đề xuất, khuyến nghị cụ thể để tối ưu hóa quản lý hải quan, hỗ trợ doanh nghiệp thông quan nhanh hơn hoặc tăng cường kiểm soát rủi ro thuế.

DỮ LIỆU THỐNG KÊ CHI TIẾT:
- Các chỉ số KPI chính:
  + Tổng số tờ khai: ${body.kpis.totalDeclarations.toLocaleString()}
  + Tổng kim ngạch xuất nhập khẩu: ${body.kpis.totalValueUSD.toLocaleString()} USD
  + Tổng số lượng container: ${body.kpis.totalContainers.toLocaleString()}
  + Tổng trọng lượng hàng hóa: ${body.kpis.totalWeightTNE.toLocaleString()} tấn
  + Tổng số thuế thu được: ${body.kpis.totalTaxVND.toLocaleString()} VND
- Cơ cấu chi tiết thuế thu được (VND):
  + Thuế xuất nhập khẩu (thueXNK): ${body.taxBreakdown.thueXNK.toLocaleString()}
  + Thuế VAT (thueV): ${body.taxBreakdown.thueV.toLocaleString()}
  + Thuế tiêu thụ đặc biệt (thueT): ${body.taxBreakdown.thueT.toLocaleString()}
  + Thuế bảo vệ môi trường (thueM): ${body.taxBreakdown.thueM.toLocaleString()}
  + Thuế tự vệ/chống bán phá giá (thueB): ${body.taxBreakdown.thueB.toLocaleString()}
  + Thuế khác (thueG): ${body.taxBreakdown.thueG.toLocaleString()}
  + Thuế thu khác ngoài hàng hóa (thueKhac): ${body.taxBreakdown.thueKhac.toLocaleString()}
- Nhóm hàng hóa hàng đầu giao dịch:
  ${JSON.stringify(body.commodities.slice(0, 5))}
- Đối tác quốc tế lớn nhất:
  ${JSON.stringify(body.countries.slice(0, 5))}
- Doanh nghiệp hoạt động lớn nhất:
  ${JSON.stringify(body.enterprises.slice(0, 5))}
- Phân bổ phân luồng tờ khai hải quan:
  ${JSON.stringify(body.channels)}

Hãy trình bày nhận định của bạn ngay lập tức dưới dạng văn bản Markdown chuẩn tiếng Việt. Không thêm các lời chào hỏi đầu đuôi của trợ lý AI.
`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    
    const responseText = result.response.text();
    return NextResponse.json({ insight: responseText });

  } catch (error: any) {
    console.error('Gemini API call failed, using local fallback. Error:', error);
    try {
      const body = await request.clone().json();
      return NextResponse.json({ 
        insight: `### BÁO CÁO NHẬN ĐỊNH HẢI QUAN (FALLBACK)\n\n*Lỗi kết nối API Gemini: ${error.message || error}*\n\n` + generateLocalInsight(body) 
      });
    } catch (e) {
      return NextResponse.json({ error: 'Failed to process request: ' + error.message }, { status: 500 });
    }
  }
}
