
-- -----------------------------
-- Table: exam_papers
-- -----------------------------
CREATE TABLE IF NOT EXISTS exam_papers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  board VARCHAR(50) NOT NULL,            -- Exam board (e.g., Edexcel)
  qualification VARCHAR(50) NOT NULL,    -- e.g., "A Level"
  subject VARCHAR(50) NOT NULL,          -- e.g., "Mathematics"
  paper_code VARCHAR(20),                -- e.g., "9MA0/01"
  paper_name VARCHAR(100),               -- e.g., "Pure Mathematics Paper 1"
  exam_session VARCHAR(20),              -- e.g., "June 2018"
  total_marks INT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------
-- Table: question_bank
-- -----------------------------
CREATE TABLE IF NOT EXISTS question_bank (
  id INT AUTO_INCREMENT PRIMARY KEY,
  exam_paper_id INT NOT NULL,
  question_number VARCHAR(10),
  label VARCHAR(10),
  level ENUM('main', 'sub') NOT NULL,
  marks INT DEFAULT NULL,
  question_text TEXT,
  question_content JSON DEFAULT NULL,
  latex_blocks JSON DEFAULT NULL,
  image_path VARCHAR(255) DEFAULT NULL,
  exemplar_answer TEXT DEFAULT NULL,
  gpt_guidance TEXT DEFAULT NULL,
  expected_keywords JSON DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (exam_paper_id) REFERENCES exam_papers(id) ON DELETE CASCADE
);

-- -----------------------------
-- Table: mark_schemes
-- -----------------------------
CREATE TABLE IF NOT EXISTS mark_schemes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_bank_id INT NOT NULL,
  part_label VARCHAR(20) DEFAULT NULL,
  mark_type ENUM('M', 'A', 'B') NOT NULL,
  mark_value INT NOT NULL DEFAULT 1,
  description TEXT,
  ao_code VARCHAR(10) DEFAULT NULL,
  is_starred BOOLEAN DEFAULT FALSE,
  step_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_bank_id) REFERENCES question_bank(id) ON DELETE CASCADE
);
