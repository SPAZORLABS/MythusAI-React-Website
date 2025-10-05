import React, { forwardRef } from 'react';
import { TextField, TimeField, SelectField } from './Field';
import { Section } from './Section';
import { SceneTable } from './SceneTable';
import { CastTable } from './CastTable';
import { FeatureJuniorTable } from './FeatureJuniorTable';
import { ScenesProvider } from '@/contexts/ScenesContext';
import { data } from 'react-router-dom';

export const CallSheetRoot = forwardRef<HTMLDivElement, { screenplay_id: string }>(({ screenplay_id }, ref) => {
  return (
    <div ref={ref} className="w-full max-w-4xl mx-auto bg-white font-mono text-xs p-2 space-y-0 ">
      {/* Header */}
      <div className="border border-black">
        <div className="text-center font-bold text-sm p-2 border-b border-black">
          CALL SHEET
        </div>
        <div className="text-center p-1">
          <TextField path="day" className="text-center font-bold" placeholder="DAY:" />
        </div>
      </div>

      {/* Main Info Grid */}
      <div className="border-l border-r border-b border-black">
        <div className="grid grid-cols-3 items-stretch">
          {/* Left Column */}
          <div className="border-r border-black flex flex-col">
            <div className="border-b border-black p-2 col-span-1 flex-1">
              <div className="font-bold text-center mb-2">PRODUCTION HOUSE ADDRESS</div>
              <TextField path="productionHouseAddress" className="w-full text-center" multiline rows={4} />
            </div>
            
            <div className="p-2 border-b border-black col-span-1 flex-1">
              <div className="font-bold mb-1">NOTE:</div>
              <div className="text-xs space-y-1">
                <div>*NO SMOKING ON SET.</div>
                <div>*PHONE ON SILENT MODE.</div>
                <div>*NO PICTURES TO BE TAKEN</div>
                <div>ON SET OR UPLOADED ON SOCIAL MEDIA</div>
              </div>
            </div>
          </div>

          {/* Middle Column */}
          <div className="border-r border-black flex flex-col">

            <div className=" border-black pt-2 space-y-1 flex-1">
              <div className="border-b border-black mb-2">
                <div className="text-center font-bold">PRODUCTION HOUSE NAME</div>
                <TextField path="productionHouseName" className="w-full text-center" />
                
                <div className="text-center font-bold mt-2">TITLE OF THE FILM</div>
                <TextField path="titleOfFilm" className="w-full text-center" />
              </div>
            </div>

            <div className="border-b border-black space-y-1 flex-1">
                <div className="text-center font-bold mt-2">SHOOT DATE:</div>
                <TextField path="shootDate" className="w-full text-center" />
                
                <div className="text-center font-bold">SHOOT DAY:</div>
                <TextField path="shootDay" className="w-full text-center" />
            </div>
            
            <div className="p-2 space-y-1 flex-1">
              <div className="flex items-center justify-center">
                <span className="font-bold">CREW CALL:</span>
                <TimeField path="crewCallTime" ampmPath="crewCallAMPM" />
              </div>
              
              <div className="flex items-center justify-center">
                <span className="font-bold">SHOOT CALL:</span>
                <TimeField path="shootCallTime" ampmPath="shootCallAMPM" />
              </div>
              
              <div className="flex items-center justify-center">
                <span className="font-bold">SHIFT:</span>
                <TimeField path="shiftStartTime" ampmPath="shiftStartAMPM" />
                <span className="mx-1">TO</span>
                <TimeField path="shiftEndTime" ampmPath="shiftEndAMPM" />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col">
            <div className="border-b border-black p-2 space-y-1 flex-1">
              <div className="text-center font-bold">SHOOT LOCATION-</div>
              <TextField path="shootLocation" className="w-full text-center" />
              <div className="text-center font-bold">MAP PIN:</div>
              <TextField path="mapPin" className="w-full text-center" />
            </div>
            
            <div className="flex-1 flex flex-col items-stretch">
              <div className="flex border-b border-black items-center flex-1">
                <div className="font-bold px-2 py-1 w-1/2 border-r border-black text-left h-full">SUNRISE/SUNSET</div>
                <div className="w-1/2 px-2 py-1">
                  <TextField path="sunriseSunset" className="w-full text-left" />
                </div>
              </div>
              <div className="flex border-b border-black items-center flex-1">
                <div className="font-bold px-2 py-1 w-1/2 border-r border-black text-left h-full">WEATHER</div>
                <div className="w-1/2 px-2 py-1">
                  <TextField path="weather" className="w-full text-left" />
                </div>
              </div>
              <div className="flex items-center border-b border-black flex-1">
                <div className="font-bold px-2 py-1 w-1/2 border-r border-black text-left h-full">BREAKFAST</div>
                <div className="w-1/2 px-2 py-1">
                  <TextField path="breakfast" className="w-full text-left" />
                </div>
              </div>
              <div className="flex items-center flex-1">
                <div className="font-bold px-2 py-1 w-1/2 border-r border-black text-left h-full">LUNCH / DINNER</div>
                <div className="w-1/2 px-2 py-1">
                  <TextField path="lunchDinner" className="w-full text-left" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Crew Information */}
      <div className="border-l border-r border-b border-black">
        <div className="grid grid-cols-2">
          {/* Left Crew Column */}
          <div className="border-r border-black space-y-1">
            <div className="grid grid-cols-3 text-xs h-full border-b border-black">
              {/* Row 1 */}
              <div className="font-bold border-b border-r border-black flex items-center px-2 py-1">DIRECTOR</div>
              <div className="col-span-2 border-b border-black flex items-center px-2 py-1">
                <TextField path="director" className="w-full" />
              </div>
              {/* Row 2 */}
              <div className="font-bold border-b border-r border-black flex items-center px-2 py-1">PRODUCER</div>
              <div className="col-span-2 border-b border-black flex items-center px-2 py-1">
                <TextField path="producer" className="w-full" />
              </div>
              {/* Row 3 */}
              <div className="font-bold border-b border-r border-black flex items-center px-2 py-1">EXECUTIVE PRODUCER</div>
              <div className="col-span-2 border-b border-black flex items-center px-2 py-1">
                <TextField path="executiveProducer" className="w-full" />
              </div>
              {/* Row 4 */}
              <div className="font-bold border-b border-r border-black flex items-center px-2 py-1">LINE PRODUCER</div>
              <div className="col-span-2 border-b border-black flex items-center px-2 py-1">
                <TextField path="lineProducer" className="w-full" />
              </div>
              {/* Row 5 */}
              <div className="font-bold border-b border-r border-black flex items-center px-2 py-1">PRODUCTION ACCOUNTANT</div>
              <div className="col-span-2 border-b border-black flex items-center px-2 py-1">
                <TextField path="productionAccountant" className="w-full" />
              </div>
              {/* Row 6 */}
              <div className="font-bold border-b border-r border-black flex items-center px-2 py-1">PRODUCTION TEAM</div>
              <div className="col-span-2 border-b border-black flex items-center px-2 py-1">
                <TextField path="productionTeam" className="w-full" />
              </div>
              {/* Row 7 */}
              <div className="font-bold border-b border-r border-black flex items-center px-2 py-1">ON-SET EDITOR</div>
              <div className="col-span-2 border-b border-black flex items-center px-2 py-1">
                <TextField path="onSetEditor" className="w-full" />
              </div>
              {/* Row 8 */}
              <div className="font-bold border-b border-r border-black flex items-center px-2 py-1">GAFFER</div>
              <div className="col-span-2 border-b border-black flex items-center px-2 py-1">
                <TextField path="gaffer" className="w-full" />
              </div>
              {/* Row 9 */}
              <div className="font-bold border-b border-r border-black flex items-center px-2 py-1">WARDROBE</div>
              <div className="col-span-2 border-b border-black flex items-center px-2 py-1">
                <TextField path="wardrobe" className="w-full" />
              </div>
              {/* Row 10 */}
              <div className="font-bold border-r border-black flex items-center px-2 py-1">MAKE-UP & HAIR</div>
              <div className="col-span-2 flex items-center px-2 py-1">
                <TextField path="makeupHair" className="w-full" />
              </div>
            </div>
          </div>

          {/* Right Crew Column */}
          <div className=" space-y-1">
            <div className="grid grid-cols-3 text-xs">
              <div className="font-bold border-b border-r border-black flex items-center px-2 py-1">DOP</div>
              <div className="col-span-2 border-b border-black flex items-center px-2 py-1">
                <TextField path="dop" className="w-full" />
              </div>

              <div className="font-bold border-b border-r border-black flex items-center px-2 py-1">1ST AC</div>
              <div className="col-span-2 border-b border-black flex items-center px-2 py-1">
                <TextField path="firstAC" className="w-full" />
              </div>

              <div className="font-bold border-b border-r border-black flex items-center px-2 py-1">FOCUS PULLER 1</div>
              <div className="col-span-2 border-b border-black flex items-center px-2 py-1">
                <TextField path="focusPuller1" className="w-full" />
              </div>

              <div className="font-bold border-b border-r border-black flex items-center px-2 py-1">FOCUS PULLER 2</div>
              <div className="col-span-2 border-b border-black flex items-center px-2 py-1">
                <TextField path="focusPuller2" className="w-full" />
              </div>

              <div className="font-bold border-b border-r border-black flex items-center px-2 py-1">ACTION DIRECTOR</div>
              <div className="col-span-2 border-b border-black flex items-center px-2 py-1">
                <TextField path="actionDirector" className="w-full" />
              </div>

              <div className="font-bold border-b border-r border-black flex items-center px-2 py-1">PRODUCTION DESIGNER</div>
              <div className="col-span-2 border-b border-black flex items-center px-2 py-1">
                <TextField path="productionDesigner" className="w-full" />
              </div>

              <div className="font-bold border-b border-r border-black flex items-center px-2 py-1">CO-DIRECTOR /</div>
              <div className="col-span-2 border-b border-black flex items-center px-2 py-1"></div>

              <div className="font-bold border-b border-r border-black flex items-center px-2 py-1">FIRST ASSISTANT DIRECTOR</div>
              <div className="col-span-2 border-b border-black flex items-center px-2 py-1">
                <TextField path="coDirector" className="w-full" />
              </div>

              <div className="font-bold border-b border-r border-black flex items-center px-2 py-1">DIRECTION DEPARTMENT</div>
              <div className="col-span-2 border-b border-black flex items-center px-2 py-1">
                <TextField path="directionDepartment" className="w-full" />
              </div>

              <div className="font-bold border-b border-r border-black flex items-center px-2 py-1">ART DIRECTOR</div>
              <div className="col-span-2 border-b border-black flex items-center px-2 py-1">
                <TextField path="artDirector" className="w-full" />
              </div>

              <div className="font-bold border-b border-r border-black flex items-center px-2 py-1">ASSISTANT ART DIRECTOR</div>
              <div className="col-span-2 border-b border-black flex items-center px-2 py-1">
                <TextField path="assistantArtDirector" className="w-full" />
              </div>

              <div className="font-bold border-r border-black flex items-center px-2 py-1">ART TEAM</div>
              <div className="col-span-2 flex items-center px-2 py-1">
                <TextField path="artTeam" className="w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scenes Table */}
      <ScenesProvider screenplayId={screenplay_id}>
        <SceneTable tableName="scenes" title="SCENES" />
      </ScenesProvider>

      {/* Cast Table */}
      <CastTable />

      {/* Feature/Junior Table */}
      <FeatureJuniorTable />

      {/* Requirements Section */}
      <div className="border border-black">
        <div className="text-black text-xs font-bold p-1 text-center border-b border-black">
          REQUIREMENTS FOR THE SHOOT DAY
        </div>
        <div className="text-xs">
          <table className="w-full">
            <tbody>
              <tr className="border-b border-black">
                <td className="border-r border-black p-2 font-bold w-1/3">PROPS</td>
                <td className="p-2">
                  <span className="font-bold">To Report</span>
                  <TimeField path="propsTime" ampmPath="propsAMPM" />
                  <span>: As per PRODUCTION DESIGNER</span>
                </td>
              </tr>
              
              <tr className="border-b border-black">
                <td className="border-r border-black p-2 font-bold">ART DEPT/ SET DRESSING</td>
                <td className="p-2">
                  <span className="font-bold">To Report</span>
                  <TimeField path="artDeptTime" ampmPath="artDeptAMPM" />
                  <span>: As per PRODUCTION DESIGNER</span>
                </td>
              </tr>
              
              <tr className="border-b border-black">
                <td className="border-r border-black p-2 font-bold">WARDROBE</td>
                <td className="p-2">
                  <div>
                    <span className="font-bold">To Report</span>
                    <TimeField path="wardrobeReqTime" ampmPath="wardrobeReqAMPM" />
                    <span>As per COSTUME DESIGNER</span>
                  </div>
                  <div className="text-xs mt-1">Costume for background people</div>
                </td>
              </tr>
              
              <tr className="border-b border-black">
                <td className="border-r border-black p-2 font-bold">ACTION & TEAM</td>
                <td className="p-2">
                  <span className="font-bold">To Report</span>
                  <TimeField path="actionTeamTime" ampmPath="actionTeamAMPM" />
                  <span>As per ACTION MASTER</span>
                </td>
              </tr>
              
              <tr className="border-b border-black">
                <td className="border-r border-black p-2 font-bold">ARMS & AMMUNATIONS</td>
                <td className="p-2">
                  <span className="font-bold">To Report</span>
                  <TimeField path="armsTime" ampmPath="armsAMPM" />
                  <span>As per ACTION MASTER</span>
                </td>
              </tr>
              
              <tr className="border-b border-black">
                <td className="border-r border-black p-2 font-bold">CAMERAS</td>
                <td className="p-2">
                  <span className="font-bold">To Report</span>
                  <TimeField path="camerasTime" ampmPath="camerasAMPM" />
                  <span>: As per DOP</span>
                </td>
              </tr>
              
              <tr className="border-b border-black">
                <td className="border-r border-black p-2 font-bold">LIGHTS & TEAM</td>
                <td className="p-2">
                  <span className="font-bold">To Report</span>
                  <TimeField path="lightsTime" ampmPath="lightsAMPM" />
                  <span>As per DOP</span>
                </td>
              </tr>
              
              <tr className="border-b border-black">
                <td className="border-r border-black p-2 font-bold">SPECIAL REQUIREMENTS</td>
                <td className="p-2">
                  <span className="font-bold">To Report</span>
                  <TimeField path="specialReqTime" ampmPath="specialReqAMPM" />
                </td>
              </tr>
              
              <tr className="border-b border-black">
                <td className="border-r border-black p-2 font-bold">SOUND</td>
                <td className="p-2">
                  <span className="font-bold">To Report</span>
                  <TimeField path="soundTime" ampmPath="soundAMPM" />
                </td>
              </tr>
              
              <tr className="border-b border-black">
                <td className="border-r border-black p-2 font-bold">GENERATORS</td>
                <td className="p-2">
                  <span className="font-bold">To Report</span>
                  <TimeField path="generatorsTime" ampmPath="generatorsAMPM" />
                  <span>: Generators to be up and running by</span>
                  <TimeField path="generatorsReadyTime" ampmPath="generatorsReadyAMPM" />
                </td>
              </tr>
              
              <tr className="border-b border-black">
                <td className="border-r border-black p-2 font-bold">SECURITIES</td>
                <td className="p-2">
                  <span className="font-bold">To Report</span>
                  <TimeField path="securitiesTime" ampmPath="securitiesAMPM" />
                  <span>Sync Securities. As per Production.</span>
                </td>
              </tr>
              
              <tr className="border-b border-black">
                <td className="border-r border-black p-2 font-bold">PA SYSTEM / WALKIE TALKIES</td>
                <td className="p-2">
                  <div>
                    <span className="font-bold">To Report</span>
                    <TimeField path="paSystemTime" ampmPath="paSystemAMPM" />
                  </div>
                  <div className="text-xs mt-1">70+ walkies with headphones, --:-- AM/PM PA system with working mics x (n) - As per Production requirement.</div>
                </td>
              </tr>
              
              <tr className="border-b border-black">
                <td className="border-r border-black p-2 font-bold">VAN</td>
                <td className="p-2">
                  <span className="font-bold">To Report</span>
                  <TimeField path="vanityVansTime" ampmPath="vanityVansAMPM" />
                  <span>: Vanity vans for actors should be up and running by 08:15 AM. Count as per Production</span>
                </td>
              </tr>
              
              <tr className="border-b border-black">
                <td className="border-r border-black p-2 font-bold">PRODUCTION / LOCATION</td>
                <td className="p-2">
                  <div>
                    <span className="font-bold">To Report</span>
                    <TimeField path="productionLocationTime" ampmPath="productionLocationAMPM" />
                  </div>
                  <div className="text-xs mt-1">: Tea, Biscuits, Snacks To Be Rotated Throughout the Day. Evening Snacks to be ready by 06:00 PM.</div>
                </td>
              </tr>
              
              <tr>
                <td className="border-r border-black p-2 font-bold">VEHICLES</td>
                <td className="p-2">
                  <span className="font-bold">To Report 08:00</span>
                  <TimeField path="vehiclesTime" ampmPath="vehiclesAMPM" />
                  <span>AS PER PRODUCTION</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Advance Schedule */}
      <SceneTable tableName="advanceSchedule" title="ADVANCE SCHEDULE (IF ANY)" />

      {/* Footer */}
      <div className="border border-black">
        <div className="p-2">
          <div className="font-bold text-center">Walkie Channels: On Walkie</div>
        </div>
        <div className="border-t border-black p-2">
          <div className="text-center">
            <TextField path="filmQuote" placeholder='"FILM QUOTE"' className="text-center font-bold" />
          </div>
        </div>
      </div>
    </div>
  );
});