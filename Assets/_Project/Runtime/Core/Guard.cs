using System;

namespace Boxapult.Core
{
    public static class Guard
    {
        public static T NotNull<T>(T value, string parameterName) where T : class
        {
            return value ?? throw new ArgumentNullException(parameterName);
        }

        public static string NotBlank(string value, string parameterName)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                throw new ArgumentException("Value cannot be empty or whitespace.", parameterName);
            }

            return value;
        }

        public static float Positive(float value, string parameterName)
        {
            if (value <= 0f)
            {
                throw new ArgumentOutOfRangeException(parameterName, value, "Value must be positive.");
            }

            return value;
        }
    }
}
