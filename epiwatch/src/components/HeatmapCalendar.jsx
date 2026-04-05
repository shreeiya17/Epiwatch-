import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'

const getColor = (cases, maxCases) => {
  if (!cases || cases === 0) return '#f8fafc'
  const ratio = cases / maxCases
  if (ratio < 0.1) return '#dcfce3'
  if (ratio < 0.25) return '#86efac'
  if (ratio < 0.40) return '#10b981'
  if (ratio < 0.55) return '#f59e0b'
  if (ratio < 0.70) return '#ef8c34'
  if (ratio < 0.85) return '#ef4444'
  return '#7f1d1d'
}

const generateYearData = (baseData) => {
  const days = []
  const start = new Date('2025-04-01')
  for (let i = 0; i < 365; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    
    const found = baseData?.find(d => d.date === dateStr)
    
    // Generate realistic wave pattern if no real data
    const wave = Math.sin(i / 30) * 0.3 + 
                 Math.sin(i / 7) * 0.1 + 1
    const trend = 1 + (i / 365) * 0.4
    const noise = 0.8 + Math.random() * 0.4
    const baseCases = 50000
    
    days.push({
      date: dateStr,
      cases: found ? found.cases : 
             Math.round(baseCases * wave * trend * noise),
      dayOfWeek: date.getDay(),
      month: date.getMonth(),
      week: Math.floor(i / 7)
    })
  }
  return days
}

export default function HeatmapCalendar({ 
  data = [], title = "Daily Case Heatmap", country = "global" 
}) {
  const [hoveredCell, setHoveredCell] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({x:0, y:0})
  
  const yearData = useMemo(() => generateYearData(data), [data])
  const maxCases = useMemo(() => 
    Math.max(...yearData.map(d => d.cases)), [yearData])
  
  // Group by week
  const weeks = useMemo(() => {
    const w = []
    for (let i = 0; i < 53; i++) {
      w.push(yearData.filter(d => d.week === i))
    }
    return w
  }, [yearData])
  
  // Month label positions
  const MONTHS = ['Apr','May','Jun','Jul','Aug','Sep',
                  'Oct','Nov','Dec','Jan','Feb','Mar']
  const monthPositions = [0,4,9,13,17,22,26,30,35,39,43,48]
  
  const DAYS = ['','Mon','','Wed','','Fri','']
  
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '14px',
      padding: '20px'
    }}>
      
      {/* Header */}
      <div style={{display:'flex', justifyContent:'space-between', 
                   alignItems:'center', marginBottom:'20px'}}>
        <div>
          <div style={{fontSize:13.5, fontWeight:600, color:'#0f172a'}}>
            {title}
          </div>
          <div style={{fontSize:12, color:'#64748b', marginTop:4}}>
            Apr 2025 — Mar 2026 · {country}
          </div>
        </div>
        <span style={{
          fontSize:11, padding:'3px 10px',
          background:'rgba(16,185,129,0.12)',
          color:'#10b981', borderRadius:20, fontWeight:500
        }}>
          365 days
        </span>
      </div>
      
      {/* Calendar Grid */}
      <div style={{overflowX:'auto'}}>
        <div style={{minWidth: 700}}>
          
          {/* Month labels */}
          <div style={{
            display:'flex', marginLeft:28, marginBottom:4
          }}>
            {monthPositions.map((pos, i) => (
              <div key={i} style={{
                width: i < 11 ? 
                  (monthPositions[i+1]-pos)*14+'px' : '42px',
                fontSize:11, color:'#64748b',
                fontFamily:'DM Mono, monospace'
              }}>
                {MONTHS[i]}
              </div>
            ))}
          </div>
          
          {/* Grid with day labels */}
          <div style={{display:'flex', gap:0}}>
            
            {/* Day labels */}
            <div style={{
              display:'flex', flexDirection:'column',
              gap:2, marginRight:4, paddingTop:0
            }}>
              {DAYS.map((day, i) => (
                <div key={i} style={{
                  height:12, fontSize:10, color:'#64748b',
                  fontFamily:'DM Mono, monospace',
                  lineHeight:'12px', textAlign:'right',
                  width:24
                }}>
                  {day}
                </div>
              ))}
            </div>
            
            {/* Weeks grid */}
            <div style={{display:'flex', gap:2}}>
              {weeks.map((week, wi) => (
                <div key={wi} style={{
                  display:'flex', flexDirection:'column', gap:2
                }}>
                  {Array(7).fill(null).map((_, di) => {
                    const cell = week.find(d => d.dayOfWeek === di)
                    return (
                      <motion.div
                        key={di}
                        style={{
                          width:12, height:12,
                          borderRadius:2,
                          background: cell ? 
                            getColor(cell.cases, maxCases) : 
                            '#f8fafc',
                          cursor: cell ? 'pointer' : 'default'
                        }}
                        whileHover={{ scale: 1.4 }}
                        onMouseEnter={(e) => {
                          if (cell) {
                            setHoveredCell(cell)
                            setTooltipPos({
                              x: e.clientX, 
                              y: e.clientY
                            })
                          }
                        }}
                        onMouseLeave={() => setHoveredCell(null)}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
          
          {/* Legend */}
          <div style={{
            display:'flex', alignItems:'center', gap:6,
            marginTop:12, marginLeft:28
          }}>
            <span style={{fontSize:11, color:'#64748b'}}>Less</span>
            {['#f8fafc','#86efac','#10b981',
              '#f59e0b','#ef8c34','#ef4444','#7f1d1d'
             ].map((c,i) => (
              <div key={i} style={{
                width:12, height:12, borderRadius:2,
                background:c
              }}/>
            ))}
            <span style={{fontSize:11, color:'#64748b'}}>More</span>
          </div>
        </div>
      </div>
      
      {/* Tooltip */}
      {hoveredCell && (
        <div style={{
          position:'fixed',
          left: tooltipPos.x + 10,
          top: tooltipPos.y - 40,
          background:'#1a2235',
          border:'1px solid #3b82f6',
          borderRadius:8, padding:'6px 10px',
          fontSize:12, color:'#e8edf5',
          pointerEvents:'none', zIndex:9999,
          fontFamily:'DM Mono, monospace',
          whiteSpace:'nowrap'
        }}>
          {hoveredCell.date}: {hoveredCell.cases.toLocaleString()} cases
        </div>
      )}
      
      {/* Summary Stats */}
      <div style={{
        display:'grid', gridTemplateColumns:'repeat(4,1fr)',
        gap:12, marginTop:16,
        borderTop:'1px solid #f1f5f9',
        paddingTop:16
      }}>
        {[
          { 
            label:'Peak day', 
            value: yearData.reduce((a,b) => 
              a.cases>b.cases?a:b, yearData[0])?.date || '-'
          },
          { 
            label:'Total cases', 
            value: yearData.reduce((s,d) => 
              s+d.cases,0).toLocaleString()
          },
          { 
            label:'Daily average', 
            value: Math.round(yearData.reduce((s,d) => 
              s+d.cases,0)/365).toLocaleString()
          },
          { 
            label:'High risk days', 
            value: yearData.filter(d => 
              d.cases > maxCases*0.7).length + ' days'
          }
        ].map((stat,i) => (
          <div key={i}>
            <div style={{fontSize:11,color:'#64748b',marginBottom:4}}>
              {stat.label}
            </div>
            <div style={{
              fontSize:14, fontWeight:600, color:'#0f172a',
              fontFamily:'DM Mono, monospace'
            }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}