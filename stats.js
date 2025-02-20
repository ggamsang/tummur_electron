// 백엔드 API를 통해 오늘의 투두 목록 가져오기

const today = new Date();
const todayDate = today.toISOString().split('T')[0];
// API를 통해 오늘의 투두 목록 가져오기
fetch('/api/todos?date=' + todayDate)
  .then(response => response.json())
  .then(data => {
    console.log('오늘의 투두:', data);
  })
  .catch(error => {
    console.error('오늘의 투두 조회 중 오류:', error);
  });

//입력폼으로 오늘의 투두 추가
const inputForm = document.getElementById('inputForm');
inputForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const input = document.getElementById('input');
  const inputValue = input.value;
});
const stats = document.getElementById('stats');
stats.appendChild(inputForm);