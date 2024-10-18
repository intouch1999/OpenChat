import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default defineEventHandler(async (event) => {
  // รับ body ที่ถูกส่งมาจาก front-end
  const body = await readBody(event);
  const userMessage = body?.message || "Default question";
  const history = body?.history || [];

  // เรียกใช้งาน Groq API พร้อมประวัติการสนทนา
  const chatCompletion = await getGroqChatCompletion(userMessage, history);

  return {
    message: chatCompletion.choices[0]?.message?.content || "No response",
  };
});

// ฟังก์ชันสำหรับเรียก Groq API
async function getGroqChatCompletion(userMessage, history) {
  try {
    // แปลงประวัติการสนทนาให้อยู่ในรูปแบบที่ Groq API ต้องการ
    const formattedHistory = history.flatMap(msg => [
      { role: "user", content: msg.role === 'human' ? msg.content : '' },
      { role: "assistant", content: msg.response || '' }
    ]).filter(msg => msg.content); // กรองข้อความว่างออก

    // รวมประวัติการสนทนากับข้อความปัจจุบัน
    const messages = [
      // ส่ง system message เพื่อกำหนดบุคลิกหรือการตั้งค่าเริ่มต้น (ถ้าต้องการ)
      {
        role: "system",
        content: "คุณเป็น AI ผู้ช่วยที่เป็นมิตรและให้คำตอบที่เป็นประโยชน์ โดยตอบเป็นภาษาไทยเสมอ"
      },
      // เพิ่มประวัติการสนทนา
      ...formattedHistory,
      // เพิ่มข้อความปัจจุบัน
      {
        role: "user",
        content: userMessage,
      }
    ];

    return await groq.chat.completions.create({
      messages,
      model: "llama3-8b-8192",
      // เพิ่มพารามิเตอร์อื่นๆ ตามต้องการ
      temperature: 0.7, // ควบคุมความสร้างสรรค์ในการตอบ (0-1)
      max_tokens: 1000, // จำกัดความยาวของคำตอบ
    });
  } catch (error) {
    console.error("Error calling Groq API:", error);
    return { 
      choices: [{ 
        message: { 
          content: "ขออภัย เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง" 
        } 
      }] 
    };
  }
}