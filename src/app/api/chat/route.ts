import { createGroq } from '@ai-sdk/groq';
import { streamText, tool as aiTool } from 'ai';
import { z } from 'zod';
import { getStock, deleteDonor, addTransaction, getDonors, updateStock, updateTransactionStatus, addDonor } from '@/utils/dbManager';

const tool: any = aiTool;

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export const maxDuration = 30;

export async function POST(req: Request) {
  const body = await req.json();
  const rawMessages = Array.isArray(body) ? body : (body.messages || []);
  
  const coreMessages: any[] = [];
  
  for (const msg of rawMessages) {
    if (msg.role === 'user' || msg.role === 'system') {
      coreMessages.push({ role: msg.role, content: msg.content || '' });
    } else if (msg.role === 'assistant') {
      const contentParts: any[] = [];
      const toolResults: any[] = [];
      
      if (msg.parts && Array.isArray(msg.parts)) {
        for (const p of msg.parts) {
          if (p.type === 'text') {
            contentParts.push({ type: 'text', text: p.text || '' });
          } else if (p.type === 'tool-invocation' || p.type?.startsWith('tool-')) {
            const toolName = p.toolName || (p.type?.startsWith('tool-') ? p.type.substring(5) : 'unknown_tool');
            const toolCallId = p.toolCallId || p.toolInvocationId || `call_${Math.random().toString(36).substring(7)}`;
            
            let safeArgs = p.args || p.input || {};
            if (Object.keys(safeArgs).length === 0) {
              if (toolName === 'get_donor_by_id' || toolName === 'delete_donor' || toolName === 'get_donor_location_link') {
                safeArgs = { donorId: 1 };
              } else if (toolName === 'check_stock') {
                safeArgs = { bloodGroup: 'A+' };
              } else if (toolName === 'search_donors') {
                safeArgs = { bloodGroup: 'A+' };
              } else if (toolName === 'update_stock') {
                safeArgs = { bloodGroup: 'A+', unitsChange: 0 };
              } else if (toolName === 'request_blood') {
                safeArgs = { bloodGroup: 'A+', units: 0 };
              } else if (toolName === 'approve_transaction') {
                safeArgs = { transactionId: '0' };
              } else if (toolName === 'run_demand_prediction') {
                safeArgs = { bloodGroup: 'A+', simDengue: false, simHoliday: false };
              }
            }

            contentParts.push({
              type: 'tool-call',
              toolCallId: toolCallId,
              toolName: toolName,
              args: safeArgs,
              input: safeArgs
            });
            
            // ALWAYS guarantee a tool result for every tool call so AI_MissingToolResultsError can never happen
            const resValue = p.output !== undefined 
              ? p.output 
              : (p.result !== undefined ? p.result : { success: true, message: 'Action executed successfully.' });
            
            toolResults.push({
              type: 'tool-result',
              toolCallId: toolCallId,
              toolName: toolName,
              result: resValue,
              output: { type: 'json', value: resValue }
            });
          }
        }
      } else if (msg.content) {
        contentParts.push({ type: 'text', text: msg.content });
      }
      
      if (contentParts.length > 0) {
        coreMessages.push({ role: 'assistant', content: contentParts });
      }
      
      if (toolResults.length > 0) {
        coreMessages.push({ role: 'tool', content: toolResults });
      }
    } else if (msg.role === 'tool') {
       // if frontend sends a proper tool message
       const toolResults: any[] = [];
       if (msg.parts && Array.isArray(msg.parts)) {
         for (const p of msg.parts) {
           const resValue = p.result || p.output || { success: true };
           toolResults.push({
             type: 'tool-result',
             toolCallId: p.toolCallId || p.toolInvocationId || `call_${Math.random().toString(36).substring(7)}`,
             toolName: p.toolName || 'unknown_tool',
             result: resValue,
             output: { type: 'json', value: resValue }
           });
         }
       }
       if (toolResults.length > 0) {
         coreMessages.push({ role: 'tool', content: toolResults });
       }
    }
  }

  // Extract latest user message text for automatic fallback parsing if LLM passes empty args
  const lastUserMsg = [...rawMessages].reverse().find(m => m.role === 'user')?.content || '';

  const extractIdFromText = (text: string): number => {
    const match = text.match(/(?:donor\s*(?:id)?|id|#)\s*[:#]?\s*(\d+)/i) || text.match(/\b(\d+)\b/);
    return match ? parseInt(match[1], 10) : 1;
  };

  const extractBgFromText = (text: string): string => {
    const clean = text.replace(/["'?]/g, ' ');
    const match = clean.match(/(AB|A|B|O)\s*(\+|-|pos|neg|positive|negative)/i);
    if (match) {
      const type = match[1].toUpperCase();
      const signRaw = match[2].toLowerCase();
      const sign = (signRaw.startsWith('neg') || signRaw === '-') ? '-' : '+';
      return `${type}${sign}`;
    }
    const single = clean.match(/\b(AB|A|B|O)\b/i);
    if (single) return `${single[1].toUpperCase()}+`;
    return 'A+';
  };

  try {
    const result = (streamText as any)({
      model: groq('llama-3.3-70b-versatile'),
      messages: coreMessages,
      maxSteps: 5,
      system: `You are the Actionable AI Assistant for the Blood Bank Management System (BBMS).
You can execute actions directly in the database using your tools.

CRITICAL INSTRUCTIONS FOR TOOL CALLS:
1. When asked for donor details (e.g. "show me info of donor id 5", "give me info of ID 5", "details of donor 5"), call get_donor_by_id with { donorId: 5 }.
2. When asked for donor location/GPS (e.g. "location of id 4", "where is donor 5"), call get_donor_location_link with { donorId: 4 }.
3. When asked to check how many donors we have or find donors (e.g. "how many a+ donor we have?", "find donors in Dhaka"), call search_donors with { bloodGroup: "A+" } or { city: "Dhaka" }.
4. When the user says "add a donor", "register a donor", or asks to add someone without giving details:
   - DO NOT call add_donor with empty or placeholder data.
   - Conversationally ask the user to provide the donor's details:
     • Full Name
     • Blood Group (e.g. A+, O-, B+)
     • Phone Number
     • City & Address
   - ONLY call add_donor when the user has provided the donor's name and details.
5. When asked to delete a donor (e.g. "delete donor 5"), call delete_donor with { donorId: 5 }.
6. When asked about stock for a specific blood group (e.g. "how much a- blood we have?", "check O- stock"), call check_stock with { bloodGroup: "A-" }.
7. When asked to check all stock, overall inventory, or expiry dates (e.g. "check expiry", "show stock", "list all inventory"), call check_all_stock with {}.
8. When a hospital requests blood, call request_blood with { bloodGroup: "...", units: ... }.
9. When asked to run AI demand prediction, call run_demand_prediction with { bloodGroup: "...", simDengue: false, simHoliday: false }.

ALWAYS answer the user with a helpful, conversational summary of the result after executing any tool.
Keep your responses concise, professional, and friendly.`,
      tools: {
        check_all_stock: tool({
          description: 'Check the complete blood stock inventory and expiry dates for all blood groups.',
          inputSchema: z.object({}),
          parameters: z.object({}),
          execute: async () => {
            const stock = await getStock();
            const formatted = stock.map(s => ({
              bloodGroup: s.bloodGroup,
              units: s.units,
              expiryDate: s.expiryDate || 'N/A'
            }));
            const summary = formatted.map(s => `${s.bloodGroup}: ${s.units} units (Expiry: ${s.expiryDate})`).join(', ');
            return {
              success: true,
              message: `Current Inventory: ${summary}`,
              stock: formatted
            };
          },
        }),
        check_stock: tool({
          description: 'Check the current inventory and expiry of a specific blood group.',
          inputSchema: z.object({
            bloodGroup: z.string().describe('The blood group to check (e.g., A+, A-, B+, B-, O+, O-, AB+, AB-)'),
          }),
          parameters: z.object({
            bloodGroup: z.string().describe('The blood group to check (e.g., A+, A-, B+, B-, O+, O-, AB+, AB-)'),
          }),
          execute: async (args: any) => {
            let raw = args.bloodGroup ?? args.group ?? args.blood_group ?? args.type;
            if (!raw || raw === '{}') {
              raw = extractBgFromText(lastUserMsg);
            }
            const bg = String(raw).toUpperCase().trim();
            const stock = await getStock();
            const item = stock.find((s) => s.bloodGroup.toUpperCase() === bg);
            if (item) {
              return {
                success: true,
                message: `We currently have ${item.units} units of ${bg} available in stock (Expiry Date: ${item.expiryDate || 'N/A'}).`,
                units: item.units,
                expiryDate: item.expiryDate
              };
            }
            return { success: true, message: `We have 0 units of ${bg} available in stock.`, units: 0 };
          },
        }),
        search_donors: tool({
          description: 'Search, filter, or count registered donors by blood group, city, or name.',
          inputSchema: z.object({
            bloodGroup: z.string().optional().describe('Blood group to filter by (e.g. A+, O-, B+)'),
            city: z.string().optional().describe('City to filter by (e.g. Dhaka, Chittagong, Sylhet)'),
          }),
          parameters: z.object({
            bloodGroup: z.string().optional().describe('Blood group to filter by (e.g. A+, O-, B+)'),
            city: z.string().optional().describe('City to filter by (e.g. Dhaka, Chittagong, Sylhet)'),
          }),
          execute: async (args: any) => {
            let bg = args.bloodGroup ? String(args.bloodGroup).toUpperCase().trim() : undefined;
            if (!bg && !args.city) {
              bg = extractBgFromText(lastUserMsg);
            }
            const city = args.city ? String(args.city).trim().toLowerCase() : undefined;
            const donors = await getDonors();
            
            const filtered = donors.filter(d => {
              let match = true;
              if (bg && d.bloodGroup.toUpperCase() !== bg) match = false;
              if (city && !d.city.toLowerCase().includes(city)) match = false;
              return match;
            });

            const count = filtered.length;
            const sample = filtered.slice(0, 5).map(d => `${d.name} (#${d.donorId}, ${d.bloodGroup}, ${d.city})`).join('; ');
            
            return {
              success: true,
              count,
              message: `Found ${count} registered donor${count === 1 ? '' : 's'}${bg ? ` with blood group ${bg}` : ''}${city ? ` in ${city}` : ''}.${count > 0 ? ` (e.g. ${sample})` : ''}`,
              donors: filtered.slice(0, 5)
            };
          },
        }),
        add_donor: tool({
          description: 'Register a new blood donor into the database. ONLY call this tool when the user has provided the donor\'s actual name and details.',
          inputSchema: z.object({
            name: z.string().describe('Full name of the donor'),
            bloodGroup: z.string().describe('Blood group (e.g. A+, O-, B+, AB+)'),
            phone: z.string().optional().describe('Phone number'),
            city: z.string().optional().describe('City (e.g. Dhaka, Chittagong)'),
            address: z.string().optional().describe('Street address'),
          }),
          parameters: z.object({
            name: z.string().describe('Full name of the donor'),
            bloodGroup: z.string().describe('Blood group (e.g. A+, O-, B+, AB+)'),
            phone: z.string().optional().describe('Phone number'),
            city: z.string().optional().describe('City (e.g. Dhaka, Chittagong)'),
            address: z.string().optional().describe('Street address'),
          }),
          execute: async (args: any) => {
            const name = (args.name || '').trim();
            let bg = args.bloodGroup ? String(args.bloodGroup).toUpperCase().trim() : '';
            if (!bg) bg = extractBgFromText(lastUserMsg);

            if (!name || name.toLowerCase() === 'new registered donor' || name.toLowerCase() === 'donor') {
              return {
                success: false,
                message: 'Please provide the donor\'s Name, Blood Group, Phone Number, and City to complete registration.'
              };
            }

            const phone = args.phone || '01700000000';
            const city = args.city || 'Dhaka';
            const address = args.address || `${city}, Bangladesh`;
            const today = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
            
            const newDonor = await addDonor({
              name,
              fatherName: 'N/A',
              motherName: 'N/A',
              DOB: '01-01-1995',
              Phone: phone,
              gender: 'Male',
              email: `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com`,
              bloodGroup: bg || 'O+',
              city,
              address,
              dateOfDonation: today
            });

            return {
              success: true,
              message: `Successfully registered donor ${newDonor.name} (Donor ID #${newDonor.donorId}, Blood Group: ${newDonor.bloodGroup}, City: ${newDonor.city}).`,
              donor: newDonor
            };
          },
        }),
        update_stock: tool({
          description: 'Manually add or deduct blood units from the central inventory.',
          inputSchema: z.object({
            bloodGroup: z.string().describe('The blood group to update (e.g., A+, O-).'),
            unitsChange: z.number().describe('The number of units to add (positive) or deduct (negative).'),
          }),
          parameters: z.object({
            bloodGroup: z.string().describe('The blood group to update (e.g., A+, O-).'),
            unitsChange: z.number().describe('The number of units to add (positive) or deduct (negative).'),
          }),
          execute: async (args: any) => {
            let bg = args.bloodGroup ?? args.group;
            if (!bg) bg = extractBgFromText(lastUserMsg);
            const change = Number(args.unitsChange ?? args.units ?? args.amount ?? 1);
            return await updateStock(String(bg).toUpperCase().trim(), change);
          },
        }),
        delete_donor: tool({
          description: 'Permanently delete a donor from the database by their numerical ID.',
          inputSchema: z.object({
            donorId: z.union([z.string(), z.number()]).describe('The numerical ID of the donor to delete (e.g. 5 or "5").'),
          }),
          parameters: z.object({
            donorId: z.union([z.string(), z.number()]).describe('The numerical ID of the donor to delete (e.g. 5 or "5").'),
          }),
          execute: async (args: any) => {
            let raw = args.donorId ?? args.id ?? args.donor_id ?? args.donorID;
            let id = typeof raw === 'number' ? raw : parseInt(String(raw || ''), 10);
            if (isNaN(id)) {
              id = extractIdFromText(lastUserMsg);
            }
            const success = await deleteDonor(id);
            if (success) return { success: true, message: `Donor #${id} was successfully deleted from records.` };
            return { success: false, message: `Failed to delete Donor #${id}.` };
          },
        }),
        get_donor_by_id: tool({
          description: 'Fetch complete profile data for a donor by their numeric ID (e.g. donorId: 5).',
          inputSchema: z.object({
            donorId: z.union([z.string(), z.number()]).describe('The numerical ID of the donor to lookup (e.g. 5 or "5").'),
          }),
          parameters: z.object({
            donorId: z.union([z.string(), z.number()]).describe('The numerical ID of the donor to lookup (e.g. 5 or "5").'),
          }),
          execute: async (args: any) => {
            let raw = args.donorId ?? args.id ?? args.donor_id ?? args.donorID ?? args.number;
            let id = typeof raw === 'number' ? raw : parseInt(String(raw || ''), 10);
            if (isNaN(id)) {
              id = extractIdFromText(lastUserMsg);
            }
            const donors = await getDonors();
            const donor = donors.find(d => Number(d.donorId) === id);
            if (donor) {
              return {
                success: true,
                donor,
                message: `Donor #${donor.donorId}: ${donor.name}, Blood Group: ${donor.bloodGroup}, Phone: ${donor.Phone}, City: ${donor.city}, Last Donation: ${donor.dateOfDonation}.`
              };
            }
            return { success: false, message: `Donor ID #${id} was not found in the database.` };
          },
        }),
        get_donor_location_link: tool({
          description: 'Get Google Maps URL for a donor based on their numeric ID.',
          inputSchema: z.object({
            donorId: z.union([z.string(), z.number()]).describe('The numeric ID of the donor.'),
          }),
          parameters: z.object({
            donorId: z.union([z.string(), z.number()]).describe('The numeric ID of the donor.'),
          }),
          execute: async (args: any) => {
            let raw = args.donorId ?? args.id ?? args.donor_id ?? args.donorID;
            let id = typeof raw === 'number' ? raw : parseInt(String(raw || ''), 10);
            if (isNaN(id)) {
              id = extractIdFromText(lastUserMsg);
            }
            const donors = await getDonors();
            const donor = donors.find(d => Number(d.donorId) === id);
            if (donor) {
              const query = (donor.latitude && donor.longitude && (donor.latitude !== 0 || donor.longitude !== 0))
                ? `${donor.latitude},${donor.longitude}`
                : encodeURIComponent(`${donor.address || donor.city}, Bangladesh`);
              const link = `https://www.google.com/maps?q=${query}`;
              return {
                success: true,
                link,
                message: `GPS location link for ${donor.name} (Donor #${id}): ${link} (${donor.address || donor.city})`
              };
            }
            return { success: false, message: `Donor ID #${id} not found in database.` };
          },
        }),
        request_blood: tool({
          description: 'Submit a pending request for blood units on behalf of a hospital.',
          inputSchema: z.object({
            bloodGroup: z.string().describe('The blood group to request.'),
            units: z.number().describe('The number of units to request.'),
          }),
          parameters: z.object({
            bloodGroup: z.string().describe('The blood group to request.'),
            units: z.number().describe('The number of units to request.'),
          }),
          execute: async ({ bloodGroup, units }: any) => {
            const bg = bloodGroup.toUpperCase();
            const todayDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
            try {
              await addTransaction({
                patientName: 'Agent Request',
                hospitalName: 'Hospital Portal (Agent)',
                bloodGroup: bg,
                units: units,
                date: todayDate,
                status: 'PENDING'
              });
              return { success: true, message: `Successfully submitted request for ${units} units of ${bg}.` };
            } catch (e) {
              return { success: false, message: `Failed to create request: ${(e as Error).message}` };
            }
          },
        }),
        approve_transaction: tool({
          description: 'Approve a pending transaction and mark it as DELIVERED.',
          inputSchema: z.object({ transactionId: z.string().describe('The ID of the transaction to approve.') }),
          parameters: z.object({ transactionId: z.string().describe('The ID of the transaction to approve.') }),
          execute: async ({ transactionId }: any) => {
            return await updateTransactionStatus(parseInt(transactionId, 10), 'DELIVERED');
          },
        }),
        run_demand_prediction: tool({
          description: 'Run the AI Demand Prediction engine for a specific blood group.',
          inputSchema: z.object({
            bloodGroup: z.string().describe('The blood group to predict.'),
            simDengue: z.boolean().describe('Whether to simulate a Dengue Outbreak.'),
            simHoliday: z.boolean().describe('Whether to simulate an Eid/Holiday traffic spike.'),
          }),
          parameters: z.object({
            bloodGroup: z.string().describe('The blood group to predict.'),
            simDengue: z.boolean().describe('Whether to simulate a Dengue Outbreak.'),
            simHoliday: z.boolean().describe('Whether to simulate an Eid/Holiday traffic spike.'),
          }),
          execute: async ({ bloodGroup, simDengue, simHoliday }: any) => {
            const bg = bloodGroup.toUpperCase();
            const stock = await getStock();
            const item = stock.find((s) => s.bloodGroup === bg);
            const units = item ? item.units : 0;
            
            let baseDemand = 1;
            switch (bg) {
              case 'O+': baseDemand = 5; break;
              case 'A+': baseDemand = 4; break;
              case 'B+': baseDemand = 3; break;
              case 'O-': baseDemand = 2; break;
              default: baseDemand = 1; break;
            }

            if (simDengue && (bg === 'O+' || bg === 'B+')) baseDemand = Math.floor(baseDemand * 2.5);
            if (simHoliday) baseDemand = Math.floor(baseDemand * 1.5);

            const daysLeft = baseDemand > 0 ? Math.floor(units / baseDemand) : 0;
            const deficit = (baseDemand * 7) - units;

            let status = 'Healthy Supply';
            let severity = 'healthy';

            if (units === 0) { status = `CRITICAL: Collect ${deficit} units ASAP!`; severity = 'critical'; }
            else if (daysLeft < 3) { status = `URGENT: Collect ${deficit} more units this week`; severity = 'urgent'; }
            else if (daysLeft < 7) { status = `WARNING: Collect ${deficit} more units this week`; severity = 'warning'; }
            else if (deficit > 0) { status = `Target: Collect ${deficit} more units`; severity = 'warning'; }

            return { success: true, report: { bloodGroup: bg, currentUnits: units, simulatedDailyDemand: baseDemand, supplyLastsForDays: daysLeft, severity, recommendation: status } };
          },
        }),
      } as any,
    });

    return result.toUIMessageStreamResponse();
  } catch (e: any) {
    console.error('STREAM TEXT THREW:', e);
    console.log('CORE MESSAGES PAYLOAD WAS:', JSON.stringify(coreMessages, null, 2));
    throw e;
  }
}
