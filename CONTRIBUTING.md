# 🤝 Contributing to ATSA Playground

Thank you for your interest in contributing to ATSA Playground! We welcome contributions from developers, data scientists, educators, and time series enthusiasts.

## 🌟 How to Contribute

### 🐛 Reporting Bugs

1. **Check existing issues** first to avoid duplicates
2. **Use the bug report template** when creating new issues
3. **Include detailed information**:
   - Operating system and version
   - Python/Node.js versions
   - Steps to reproduce the issue
   - Expected vs actual behavior
   - Screenshots if applicable

### 💡 Suggesting Features

1. **Open a feature request** using the provided template
2. **Describe the use case** and potential benefits
3. **Consider the scope** - does it fit the project's goals?
4. **Propose implementation** if you have ideas

### 🔧 Code Contributions

#### Getting Started

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/yourusername/atsa-playground.git
   cd atsa-playground
   ```
3. **Set up the development environment**:
   ```bash
   # Windows
   setup.bat
   
   # macOS/Linux
   chmod +x setup.sh
   ./setup.sh
   ```

#### Development Workflow

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards

3. **Test your changes**:
   ```bash
   # Backend tests
   cd backend
   pytest
   
   # Frontend tests
   cd frontend
   npm test
   ```

4. **Commit your changes**:
   ```bash
   git commit -m "feat: add amazing new feature
   
   - Detailed description of changes
   - Why the change was needed
   - Any breaking changes"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** with a clear description

## 📋 Development Guidelines

### 🐍 Backend (Python/FastAPI)

#### Code Style
- **PEP 8** compliance
- **Type hints** for all functions and methods
- **Docstrings** for all public functions
- **Maximum line length**: 88 characters (Black formatter)

#### Example:
```python
from typing import List, Optional
import pandas as pd

def process_time_series(
    data: pd.DataFrame, 
    column: str,
    frequency: Optional[str] = None
) -> pd.DataFrame:
    """
    Process time series data for analysis.
    
    Args:
        data: Input DataFrame with time series data
        column: Name of the target column
        frequency: Optional frequency string (e.g., 'D', 'M')
    
    Returns:
        Processed DataFrame ready for modeling
        
    Raises:
        ValueError: If column not found in DataFrame
    """
    if column not in data.columns:
        raise ValueError(f"Column '{column}' not found in DataFrame")
    
    # Implementation here
    return processed_data
```

#### Testing
- **pytest** for unit tests
- **Test coverage** >80%
- **Mock external dependencies**
- **Test both success and error cases**

```python
def test_process_time_series_success():
    """Test successful time series processing."""
    data = pd.DataFrame({'date': ['2023-01-01'], 'value': [100]})
    result = process_time_series(data, 'value')
    assert len(result) == 1

def test_process_time_series_missing_column():
    """Test error handling for missing column."""
    data = pd.DataFrame({'date': ['2023-01-01'], 'value': [100]})
    with pytest.raises(ValueError, match="Column 'missing' not found"):
        process_time_series(data, 'missing')
```

### ⚛️ Frontend (React/TypeScript)

#### Code Style
- **TypeScript strict mode**
- **ESLint** configuration compliance
- **Prettier** for code formatting
- **Functional components** with hooks

#### Example:
```typescript
interface TimeSeriesChartProps {
  data: TimeSeriesData[];
  loading?: boolean;
  onPointClick?: (point: TimeSeriesData) => void;
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  loading = false,
  onPointClick
}) => {
  const [selectedPoint, setSelectedPoint] = useState<TimeSeriesData | null>(null);

  const handlePointClick = useCallback((point: TimeSeriesData) => {
    setSelectedPoint(point);
    onPointClick?.(point);
  }, [onPointClick]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="time-series-chart">
      {/* Chart implementation */}
    </div>
  );
};
```

#### Component Guidelines
- **Single Responsibility Principle**
- **Reusable components** in `/components`
- **Page components** in `/pages`
- **Custom hooks** for shared logic
- **Proper prop types** and default values

#### Testing
- **React Testing Library** for component tests
- **Jest** for unit tests
- **Test user interactions** and accessibility
- **Mock API calls** appropriately

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { TimeSeriesChart } from './TimeSeriesChart';

describe('TimeSeriesChart', () => {
  const mockData = [
    { date: '2023-01-01', value: 100 },
    { date: '2023-01-02', value: 105 }
  ];

  it('renders chart with data', () => {
    render(<TimeSeriesChart data={mockData} />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<TimeSeriesChart data={[]} loading />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
```

### 🎨 UI/UX Guidelines

#### Design System
- **Consistent spacing** using Tailwind CSS utilities
- **Neumorphic design** elements for modern look
- **Accessible color palette** (WCAG 2.1 AA compliance)
- **Responsive design** for all screen sizes

#### Component Patterns
```typescript
// Button component example
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  ...props 
}) => {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200';
  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-500 hover:bg-red-600 text-white'
  };
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
```

## 📚 Adding Learning Content

### Content Structure
Learning modules are stored in `backend/app/data/learning_content.json`:

```json
{
  "modules": [
    {
      "id": "module-id",
      "title": "Module Title",
      "description": "Brief description",
      "duration": "60 minutes",
      "difficulty": "Beginner|Intermediate|Advanced",
      "content": [
        {
          "type": "introduction|mathematical|practical|code_example|case_study",
          "title": "Section Title",
          "content": "Markdown content with mathematical expressions"
        }
      ],
      "quiz": {
        "questions": [
          {
            "id": 1,
            "type": "multiple_choice|true_false|coding",
            "question": "Question text",
            "options": ["Option 1", "Option 2"],
            "correct_answer": 0,
            "explanation": "Explanation of correct answer"
          }
        ]
      }
    }
  ]
}
```

### Content Guidelines
- **Mathematical accuracy** - verify all equations
- **Practical examples** - include real-world applications  
- **Code quality** - working, well-commented examples
- **Progressive difficulty** - build concepts gradually
- **Interactive elements** - engage learners actively

## 🧪 Testing Strategy

### Test Categories

1. **Unit Tests**: Individual functions and components
2. **Integration Tests**: API endpoints and data flow
3. **End-to-End Tests**: Complete user workflows
4. **Performance Tests**: Loading times and responsiveness

### Running Tests

```bash
# All tests
npm run test:all

# Backend only
cd backend && pytest

# Frontend only  
cd frontend && npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## 🚀 Release Process

### Version Numbering
We follow [Semantic Versioning](https://semver.org/):
- **Major** (1.0.0): Breaking changes
- **Minor** (1.1.0): New features, backward compatible
- **Patch** (1.1.1): Bug fixes, backward compatible

### Release Checklist
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version numbers bumped
- [ ] Release notes prepared
- [ ] Security review completed

## 💬 Communication

### Getting Help
- **GitHub Discussions**: General questions and ideas
- **GitHub Issues**: Bug reports and feature requests
- **Code Reviews**: Detailed feedback on Pull Requests

### Community Guidelines
- **Be respectful** and inclusive
- **Provide constructive feedback**
- **Help newcomers** get started
- **Share knowledge** and learn from others

## 🏆 Recognition

Contributors are recognized in:
- **README.md**: Major contributors list
- **Release notes**: Feature contributors
- **All Contributors bot**: Automated recognition

Thank you for contributing to ATSA Playground! 🎯