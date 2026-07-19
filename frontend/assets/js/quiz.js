/**
 * QuizEngine — ahora SIN respuestas correctas ni explicaciones en
 * el cliente. Cada "questions[i]" solo trae { question, options }.
 * Al responder, se llama a API.validarRespuesta(seccion, i, opcion)
 * y el servidor regresa si fue correcta, cuál era la opción
 * correcta y la explicación — siempre, sin importar el resultado.
 */
const QuizEngine = {
  init: function (seccionId, questions) {
    this.seccionId = seccionId;
    this.questions = questions;
    this.answered = JSON.parse(sessionStorage.getItem('answered_' + seccionId) || '{}');
    this.totalQuestions = questions.length;
    this.pending = false;
    this.render();
    this.updateProgress();
  },

  render: function () {
    const container = document.getElementById('quiz-container');
    if (!container) return;
    container.innerHTML = '';

    this.questions.forEach((q, index) => {
      const div = document.createElement('div');
      div.className = 'quiz-question';
      div.id = 'q-' + index;

      const numSpan = document.createElement('div');
      numSpan.className = 'q-number';
      numSpan.textContent = 'PREGUNTA ' + (index + 1) + ' / ' + this.totalQuestions;
      div.appendChild(numSpan);

      const textSpan = document.createElement('div');
      textSpan.className = 'q-text';
      textSpan.textContent = q.question;
      div.appendChild(textSpan);

      const saved = this.answered[index];
      const optionsDiv = document.createElement('div');
      optionsDiv.className = 'quiz-options';

      q.options.forEach((opt, optIndex) => {
        const option = document.createElement('div');
        option.className = 'quiz-option';

        if (saved !== undefined) {
          option.classList.add('disabled');
          if (optIndex === saved.opcionCorrecta) option.classList.add('correct-answer');
          if (saved.respuesta === optIndex && optIndex !== saved.opcionCorrecta) option.classList.add('wrong-answer');
          if (saved.respuesta === optIndex) option.classList.add('selected');
        }

        const dot = document.createElement('div');
        dot.className = 'radio-dot';
        option.appendChild(dot);

        const label = document.createElement('span');
        label.textContent = opt;
        option.appendChild(label);

        if (saved === undefined) {
          option.addEventListener('click', () => this.selectAnswer(index, optIndex));
        }

        optionsDiv.appendChild(option);
      });

      div.appendChild(optionsDiv);

      const feedback = document.createElement('div');
      feedback.className = 'quiz-feedback';
      feedback.id = 'fb-' + index;
      if (saved !== undefined) {
        feedback.className = 'quiz-feedback ' + (saved.correcta ? 'correct' : 'incorrect');
        const prefijo = saved.correcta ? '✅ ¡Correcto! ' : '❌ Incorrecto. ';
        feedback.textContent = prefijo + saved.explicacion;
      } else if (this.pending === index) {
        feedback.className = 'quiz-feedback';
        feedback.textContent = 'Verificando respuesta...';
      }
      div.appendChild(feedback);

      container.appendChild(div);
    });

    this.updateProgress();
  },

  selectAnswer: async function (qIndex, opcionElegida) {
    if (this.answered[qIndex] !== undefined || this.pending !== false) return;

    this.pending = qIndex;
    this.render();

    const resultado = await API.validarRespuesta(this.seccionId, qIndex, opcionElegida);

    this.pending = false;

    if (!resultado || resultado.success === false) {
      const feedback = document.getElementById('fb-' + qIndex);
      if (feedback) {
        feedback.className = 'quiz-feedback incorrect';
        feedback.textContent = '⚠️ No se pudo validar la respuesta. Revisa tu conexión e intenta de nuevo.';
      }
      this.pending = false;
      return;
    }

    this.answered[qIndex] = {
      respuesta: opcionElegida,
      correcta: resultado.correcta,
      opcionCorrecta: resultado.opcionCorrecta,
      explicacion: resultado.explicacion
    };

    sessionStorage.setItem('answered_' + this.seccionId, JSON.stringify(this.answered));
    this.render();
    this.updateProgress();
  },

  updateProgress: function () {
    const answeredCount = Object.keys(this.answered).length;
    const progress = Math.min(100, (answeredCount / this.totalQuestions) * 100);

    const fill = document.getElementById('progress-fill');
    const label = document.getElementById('progress-label');
    if (fill) fill.style.width = progress + '%';
    if (label) label.textContent = answeredCount + ' / ' + this.totalQuestions + ' respondidas';
  },

  allAnswered: function () {
    return Object.keys(this.answered).length === this.totalQuestions;
  }
};
