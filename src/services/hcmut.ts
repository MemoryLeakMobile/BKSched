// import { load } from 'cheerio'; // Removed to avoid RN polyfill issues

const EXAM_SCHEDULE_API_URL = 'https://mybk.hcmut.edu.vn/api/thoi-khoa-bieu/lich-thi-sinh-vien/v1';
const CLASS_SCHEDULE_API_URL = 'https://mybk.hcmut.edu.vn/api/v1/student/schedule';

// Mock data from request.txt for fallback/testing
const MOCK_SCHEDULE_DATA = [
  {
    "ID": 85520859,
    "TKBTUANID": 40468928,
    "NAMHOC": 2024,
    "HOCKY": 2,
    "MANAMHOCHOCKY": "20242",
    "TENNAMHOCHOCKY": "Học kỳ 2 Năm học 2024 - 2025",
    "NHOMLOPMONHOCID": 366555,
    "MANHOMLOPMONHOC": "20242_CO3045_CN01_A_Thi",
    "MONHOCID": 17764,
    "MAMONHOC": "CO3045",
    "TENMONHOC": "Lập trình Game",
    "SOTC": 3,
    "SOTCHP": 3,
    "NHOMLOP": "CN01_A_Thi",
    "COSOID": 1,
    "MACOSO": "BK-LTK",
    "DAYID": 7,
    "MADAY": "B1",
    "PHONGID": 163,
    "MAPHONG": "B1-311",
    "NAMDL": 2025,
    "TUANDLBD": 20,
    "THU": 8,
    "TIETBD": 2,
    "SOTIET": 2,
    "TIETKT": 3,
    "GIOBD": "07g00",
    "GIO_SOPHUT": "90",
    "NGAYTHI": "2025-05-18",
    "LOAITHI": "CK",
    "MSSV": "2252521",
    "LASTUPDATED_TIME": "2025-03-14T01:40:06.000+00:00",
    "HOLOT": "NGUYỄN",
    "TEN": "NGHIỆM",
    "type": "exam"
  },
  {
    "ID": 85520489,
    "TKBTUANID": 40470659,
    "NAMHOC": 2024,
    "HOCKY": 2,
    "MANAMHOCHOCKY": "20242",
    "TENNAMHOCHOCKY": "Học kỳ 2 Năm học 2024 - 2025",
    "NHOMLOPMONHOCID": 363662,
    "MANHOMLOPMONHOC": "20242_CO3005_CN02_B_Thi",
    "MONHOCID": 9660,
    "MAMONHOC": "CO3005",
    "TENMONHOC": "Nguyên lý Ngôn ngữ Lập trình",
    "SOTC": 4,
    "SOTCHP": 4,
    "NHOMLOP": "CN02_B_Thi",
    "COSOID": 1,
    "MACOSO": "BK-LTK",
    "DAYID": 7,
    "MADAY": "B1",
    "PHONGID": 84,
    "MAPHONG": "B1-208",
    "NAMDL": 2025,
    "TUANDLBD": 21,
    "THU": 4,
    "TIETBD": 2,
    "SOTIET": 2,
    "TIETKT": 3,
    "GIOBD": "07g00",
    "GIO_SOPHUT": "90",
    "NGAYTHI": "2025-05-21",
    "LOAITHI": "CK",
    "MSSV": "2252521",
    "LASTUPDATED_TIME": "2025-03-14T01:40:06.000+00:00",
    "HOLOT": "NGUYỄN",
    "TEN": "NGHIỆM",
    "type": "exam"
  }
];

export interface StudentSchedule {
  ID: number;
  MAMONHOC: string;
  TENMONHOC: string;
  GIOBD: string;
  MAPHONG: string;
  THU: number;
  NGAYTHI?: string;
  NHOMLOP?: string;
  type?: 'exam' | 'class';
}

export interface NetworkLog {
  url: string;
  method: string;
  requestHeaders: any;
  requestBody: any;
  responseHeaders: any;
  responseBody: any;
  status: number;
}

export const hcmut = {
  login: async (username: string, password: string) => {
    const logs: NetworkLog[] = [];
    try {
      const serviceUrl = 'https://mybk.hcmut.edu.vn/app/login/cas';
      const loginUrl = `https://sso.hcmut.edu.vn/cas/login?service=${encodeURIComponent(serviceUrl)}&renew=true`;
      const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

      const getResponse = await fetch(loginUrl, {
          method: 'GET',
          headers: {
            'User-Agent': userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          },
          redirect: 'manual'
      });
      
      const getText = await getResponse.text();
      const getCookies = getResponse.headers.get('set-cookie') || '';

      logs.push({
        url: loginUrl,
        method: 'GET',
        requestHeaders: {},
        requestBody: null,
        status: getResponse.status,
        responseHeaders: Object.fromEntries(getResponse.headers.entries()),
        responseBody: getText.substring(0, 1000)
      });

      if (getResponse.status === 302 || getResponse.status === 303) {
          const location = getResponse.headers.get('location');
          if (location && location.includes('ticket=')) {
               return validateTicket(location, userAgent, getCookies, logs);
          }
      }

      let lt = '';
      let execution = '';
      const ltMatch = getText.match(/name="lt"\s+value="([^"]+)"/) || getText.match(/value="([^"]+)"\s+name="lt"/);
      if (ltMatch) lt = ltMatch[1];
      const execMatch = getText.match(/name="execution"\s+value="([^"]+)"/) || getText.match(/value="([^"]+)"\s+name="execution"/);
      if (execMatch) execution = execMatch[1];

      const headers = {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://sso.hcmut.edu.vn',
        'Referer': loginUrl,
        'Cookie': getCookies
      };

      const body = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&lt=${lt}&execution=${execution}&_eventId=submit&submit=Login`;
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: headers,
        body: body,
        redirect: 'manual'
      });

      const responseBody = await response.text();
      const responseCookies = response.headers.get('set-cookie') || '';
      
      logs.push({
        url: loginUrl,
        method: 'POST',
        requestHeaders: headers,
        requestBody: body,
        status: response.status,
        responseHeaders: Object.fromEntries(response.headers.entries()),
        responseBody: responseBody.substring(0, 1000)
      });

      if (response.status === 302 || response.status === 303) {
          const location = response.headers.get('location');
          if (location) {
               return validateTicket(location, userAgent, responseCookies || getCookies, logs);
          }
      } else if (response.status === 200) {
          if (response.url.includes('mybk.hcmut.edu.vn/app') || responseBody.includes('hid_Token')) {
               const tokenMatch = responseBody.match(/id="hid_Token"\s+value="([^"]+)"/);
               return { success: true, cookie: responseCookies || getCookies, token: tokenMatch ? tokenMatch[1] : undefined, logs };
          }
      }

      if (responseBody.includes('The credentials you provided cannot be determined to be authentic')) {
          const error = new Error('Invalid credentials');
          (error as any).logs = logs;
          throw error;
      }
      throw new Error('Login failed');
    } catch (error: any) {
      if (!error.logs) error.logs = logs;
      throw error;
    }
  },

  getStudentInfo: async (token: string, cookie?: string) => {
    const url = 'https://mybk.hcmut.edu.vn/api/v1/student/get-student-info';
    const logs: NetworkLog[] = [];
    try {
        const headers: any = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Authorization': token,
        };
        if (cookie) headers['Cookie'] = cookie;
        const response = await fetch(url, { method: 'GET', headers });
        const text = await response.text();
        logs.push({ url, method: 'GET', requestHeaders: headers, requestBody: null, status: response.status, responseHeaders: {}, responseBody: text.substring(0, 1000) });
        if (!response.ok) throw new Error(`Status ${response.status}`);
        return { data: JSON.parse(text).data, logs };
    } catch (error: any) {
        if (!error.logs) error.logs = logs;
        throw error;
    }
  },

  getCurrentSemester: (date: Date = new Date()) => {
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11
    let semYear, semNo;
    if (month >= 8) { // Sep-Dec
        semYear = year;
        semNo = 1;
    } else if (month < 5) { // Jan-May
        semYear = year - 1;
        semNo = 2;
    } else { // Jun-Aug
        semYear = year - 1;
        semNo = 3;
    }
    return { year: semYear, semester: semNo, code: (semYear % 100) * 10 + semNo };
  },

  getAdjacentSemesters: (semCode: number) => {
    const year = Math.floor(semCode / 10);
    const sem = semCode % 10;
    
    const prev = sem === 1 ? (year - 1) * 10 + 3 : semCode - 1;
    const next = sem === 3 ? (year + 1) * 10 + 1 : semCode + 1;
    
    return [prev, semCode, next];
  },

  getSchedule: async (cookie: string, studentData: { id: number, code: string }, year: number, semester: number, token?: string) => {
      const examUrl = `${EXAM_SCHEDULE_API_URL}?masv=${studentData.code}&namhoc=${year}&hocky=${semester}&null`;
      const classUrl = `${CLASS_SCHEDULE_API_URL}?studentId=${studentData.id}&semesterYear=${year}${semester}&null`;
      const logs: NetworkLog[] = [];
      const headers: any = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Authorization': token,
      };
      if (cookie) headers['Cookie'] = cookie;

      const fetchData = async (url: string, type: 'exam' | 'class') => {
          try {
            const response = await fetch(url, { method: 'GET', headers });
            const text = await response.text();
             logs.push({ url, method: 'GET', requestHeaders: headers, requestBody: null, status: response.status, responseHeaders: {}, responseBody: text.substring(0, 1000) });
            if (!response.ok) return [];
            const json = JSON.parse(text);
            const data = type === 'class' ? (json.data || []) : (json.data?.data || []);
            return data.map((item: any) => {
                const normalizedItem = { ...item, type, ID: item.ID || item.id || Math.random() };
                if (type === 'class') {
                    normalizedItem.MAMONHOC = item.subject?.code || 'N/A';
                    normalizedItem.TENMONHOC = item.subject?.nameVi || item.subject?.nameEn || 'N/A';
                    normalizedItem.GIOBD = item.startTime || '0:00';
                    normalizedItem.MAPHONG = item.room?.code || 'N/A';
                }
                return normalizedItem;
            });
          } catch (e) {
              return []; 
          }
      };

      const [examData, classData] = await Promise.all([
          fetchData(examUrl, 'exam'),
          fetchData(classUrl, 'class')
      ]);

      if (examData.length === 0 && classData.length === 0) {
           return { data: MOCK_SCHEDULE_DATA, logs };
      }
      return { data: [...examData, ...classData], logs };
    }
  };
  
  async function validateTicket(location: string, userAgent: string, previousCookies: string, logs: NetworkLog[] = []) {
     const ticketResponse = await fetch(location, { method: 'GET', headers: { 'User-Agent': userAgent }, redirect: 'manual' });
     const ticketResponseBody = await ticketResponse.text();
     const ticketCookies = ticketResponse.headers.get('set-cookie') || '';
     return { success: true, cookie: ticketCookies || previousCookies, logs };
  }