import React from 'react'
import ReportsPieCharts from './ReportsPieCharts'
import ReportsTables from './ReportsTables'
import './Reports.css'

const Reports = () => {
  return (
    <div className='main'>
    <h2 style={{marginLeft: '18%'}}>Financial</h2>
      <ReportsPieCharts/>
      <ReportsTables/>
    </div>
  )
}

export default Reports
