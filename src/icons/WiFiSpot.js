const WiFiSpot = ({
  level = 4,
  activeColor = '#2562e1',
  inactiveColor = '#737375',
}) => (
  <svg
    width="24px"
    height="24px"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2.06116 8.74752C4.80094 6.33248 8.32769 5 11.9799 5C15.6321 5 19.1589 6.33248 21.8987 8.74752C22.313 9.11271 22.9449 9.07291 23.3101 8.6586C23.6753 8.2443 23.6355 7.61238 23.2212 7.24718C20.1161 4.51015 16.1191 3 11.9799 3C7.84073 3 3.84374 4.51015 0.738665 7.24718C0.32436 7.61238 0.284551 8.2443 0.649749 8.6586C1.01495 9.07291 1.64686 9.11271 2.06116 8.74752Z"
      fill={level >= 4 ? activeColor : inactiveColor}
    />
    <path
      d="M5.62001 12.3156C7.41688 10.819 9.68147 9.99939 12.02 9.99939C14.3585 9.99939 16.6231 10.819 18.42 12.3156C18.8444 12.6691 19.4749 12.6116 19.8284 12.1873C20.1818 11.7629 20.1244 11.1324 19.7 10.7789C17.5438 8.98289 14.8263 7.99939 12.02 7.99939C9.21376 7.99939 6.49626 8.98289 4.34001 10.7789C3.91564 11.1324 3.85817 11.7629 4.21163 12.1873C4.56509 12.6116 5.19564 12.6691 5.62001 12.3156Z"
      fill={level >= 3 ? activeColor : inactiveColor}
    />
    <path
      d="M11.985 14.9985C10.9472 14.9985 9.93514 15.3214 9.08913 15.9225C8.63891 16.2424 8.01462 16.1367 7.69476 15.6864C7.37489 15.2362 7.48057 14.6119 7.9308 14.2921C9.1152 13.4506 10.5321 12.9985 11.985 12.9985C13.4378 12.9985 14.8547 13.4506 16.0391 14.2921C16.4894 14.6119 16.595 15.2362 16.2752 15.6864C15.9553 16.1367 15.331 16.2424 14.8808 15.9225C14.0348 15.3214 13.0227 14.9985 11.985 14.9985Z"
      fill={level >= 2 ? activeColor : inactiveColor}
    />
    <path
      d="M11.98 19.9973C12.5323 19.9973 12.98 19.5496 12.98 18.9973C12.98 18.445 12.5323 17.9973 11.98 17.9973C11.4277 17.9973 10.98 18.445 10.98 18.9973C10.98 19.5496 11.4277 19.9973 11.98 19.9973Z"
      fill={level >= 1 ? activeColor : inactiveColor}
    />
  </svg>
)

export default WiFiSpot