import React from 'react'
import './loading.css'

const Loading = () => {
  return (
    <div className="skeleton-wrapper">
<div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-text"></div>
    </div>
  )
}

export default Loading

// CSS for skeleton loading animations
const styles = `
  .skeleton-wrapper {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 20px;
  }

  .skeleton {
    background-color: #e0e0e0;
    border-radius: 4px;
    width: 100%;
    height: 20px;
    animation: pulse 1.5s infinite ease-in-out;
  }

  .skeleton-text {
    width: 80%;
  }

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
    100% {
      opacity: 1;
    }
  }
`

// Inject styles into the document
const styleSheet = document.createElement("style")
styleSheet.type = "text/css"
styleSheet.innerText = styles
document.head.appendChild(styleSheet)