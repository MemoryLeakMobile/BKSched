import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';

const BASE_CALENDAR_NAME = 'BKSched';
const DEFAULT_COLOR = '#5E4B8B';
const ANDROID_LOCAL_ACCOUNT_NAME = 'BKSched_Sync';
// const LEGACY_ANDROID_LOCAL_ACCOUNT_NAME = 'BKSched_Local_Account';

export const calendarService = {
    getCalendarForColor: async (color: string) => {
        let source: Calendar.Source;
        let sourceId: string | undefined;

        if (Platform.OS === 'ios') {
            // iOS: Must find a valid sourceId
            const defaultCal = await Calendar.getDefaultCalendarAsync();
            source = defaultCal.source;
            sourceId = source.id;
        } else {
            // Android: We just define the object. We don't "fetch" it.
            source = {
                isLocalAccount: false,
                name: ANDROID_LOCAL_ACCOUNT_NAME,
                type: 'com.bksched.app', // perhaps don't hard-code
            };
            // sourceId is not needed/used for creating new local calendars on Android 
            // in the same way it is on iOS.
        }

        try {
            const calendarTitle = `${BASE_CALENDAR_NAME} (${color})`;

            // Check for duplicates to prevent spamming the phone with calendars
            // (We check by title because ID changes on recreate)
            const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
            const existing = calendars.find(c => c.title === calendarTitle);
            
            if (existing) {
                // Optional: Check if we need to delete and recreate if permissions/source got weird,
                // but usually returning the existing ID is safest.
                return existing.id;
            }

            const creationConfig: any = {
                title: calendarTitle,
                color: color,
                entityType: Calendar.EntityTypes.EVENT,
                name: `bksched_${color.replace('#', '')}`,
                accessLevel: Calendar.CalendarAccessLevel.OWNER,
                ownerAccount: ANDROID_LOCAL_ACCOUNT_NAME,
                timeZone: 'Asia/Ho_Chi_Minh',
            };

            // Platform specific linkage
            if (Platform.OS === 'ios') {
                creationConfig.sourceId = sourceId;
            } else {
                creationConfig.source = source;
            }

            const newId = await Calendar.createCalendarAsync(creationConfig);
            return newId;
        } catch (e) {
            console.error(`Error creating calendar for ${color}:`, e);
            return null;
        }
    },

    syncSchedule: async (schedule: any[], classColors: Record<string, string>) => {
        const { status } = await Calendar.requestCalendarPermissionsAsync();
        if (status !== 'granted') throw new Error("Quyền truy cập lịch bị từ chối");

        // Additional permission for Android/iOS if needed
        // Note: requestRemindersPermissionsAsync is often needed on iOS for some calendar features
        if (Platform.OS === 'ios') await Calendar.requestRemindersPermissionsAsync();

        // 1. Full Cleanup
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        const myCalendars = calendars.filter(c => c.title.startsWith(BASE_CALENDAR_NAME));

        for (const cal of myCalendars) {
            try {
                await Calendar.deleteCalendarAsync(cal.id);
            } catch (e) {
                console.warn(`Failed to delete calendar ${cal.id}`, e);
            }
        }

        // 2. Group items
        const eventsByColor: Record<string, any[]> = {};
        for (const item of schedule) {
            const color = classColors[item.MAMONHOC] || DEFAULT_COLOR;
            if (!eventsByColor[color]) eventsByColor[color] = [];
            eventsByColor[color].push(item);
        }

        // 3. Recreate
        let syncedCount = 0;
        for (const [color, items] of Object.entries(eventsByColor)) {
            const calId = await calendarService.getCalendarForColor(color);
            if (!calId) continue;

            for (const item of items) {
                try {
                    let start: Date, end: Date, title: string, notes: string;

                    if (item.type === 'exam' && item.NGAYTHI) {
                        const dateParts = item.NGAYTHI.split('-');
                        const timeParts = item.GIOBD.replace('g', ':').split(':');
                        start = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]), parseInt(timeParts[0]), parseInt(timeParts[1]));
                        const duration = parseInt(item.GIO_SOPHUT || '90');
                        end = new Date(start.getTime() + duration * 60000);
                        title = `${item.TENMONHOC} (Thi)`;
                        notes = `Mã MH: ${item.MAMONHOC}\nPhòng: ${item.MAPHONG}`;
                    } else if (item.type === 'class') {
                        const weeks = (item.weekSeriesDisplay || '').split('|').filter((w: string) => w && w !== '--');
                        const year = item.calendarYear;
                        const dayOfWeek = item.dayOfWeek;
                        const [hour, min] = (item.GIOBD || '0:00').split(':').map((v: string) => parseInt(v));
                        const duration = (item.numOfLesson || 1) * 50;

                        for (const weekStr of weeks) {
                            const weekNo = parseInt(weekStr);
                            if (isNaN(weekNo)) continue;

                            const jan1 = new Date(year, 0, 1);
                            const jan1Day = jan1.getDay();
                            const offset = jan1Day === 0 ? 6 : jan1Day - 1;
                            const date = new Date(year, 0, 1 + (weekNo - 1) * 7 + (dayOfWeek - offset));
                            date.setHours(hour, min, 0, 0);

                            await Calendar.createEventAsync(calId, {
                                title: item.TENMONHOC,
                                startDate: date,
                                endDate: new Date(date.getTime() + duration * 60000),
                                timeZone: 'Asia/Ho_Chi_Minh',
                                location: item.MAPHONG,
                                notes: `Mã MH: ${item.MAMONHOC}`,
                            });
                            syncedCount++;
                        }
                        continue; // Handled recurring in loop
                    } else {
                        continue;
                    }

                    await Calendar.createEventAsync(calId, {
                        title,
                        startDate: start,
                        endDate: end,
                        timeZone: 'Asia/Ho_Chi_Minh',
                        location: item.MAPHONG,
                        notes,
                    });
                    syncedCount++;
                } catch (e) {
                    console.error("Failed to create event", e);
                }
            }
        }
        return syncedCount;
    },

    deleteAllCalendars: async () => {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        const targets = calendars.filter(c => 
            // c.source.name === LEGACY_ANDROID_LOCAL_ACCOUNT_NAME || 
            c.source.name === ANDROID_LOCAL_ACCOUNT_NAME || 
            c.title.startsWith(BASE_CALENDAR_NAME)
        );
        for (const cal of targets) {
            await Calendar.deleteCalendarAsync(cal.id);
        }
    }
};