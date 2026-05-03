file_name = input("Enter the name of the TSV file: ")

try:
    # Open the TSV file for reading
    with open(file_name, 'r') as file:
        lines = file.readlines()

    students_data = []
    m1_sum = 0
    m2_sum = 0
    final_sum = 0
    student_count = 0

    # Process each line in the file
    for line in lines:
        if not line.strip():
            continue

        # Split the line by tabs
        parts = line.strip().split()
        last_name = parts[0]
        first_name = parts[1]
        m1 = int(parts[2])
        m2 = int(parts[3])
        final = int(parts[4])

        # Compute student average and assign letter grade
        avg = (m1 + m2 + final) / 3
        if avg >= 90:
            grade = 'A'
        elif avg >= 80:
            grade = 'B'
        elif avg >= 70:
            grade = 'C'
        elif avg >= 60:
            grade = 'D'
        else:
            grade = 'F'

        # Store data for the report
        students_data.append(f"{last_name}\t{first_name}\t{m1}\t{m2}\t{final}\t{grade}")

        # Accumulate totals for class averages
        m1_sum += m1
        m2_sum += m2
        final_sum += final
        student_count += 1

    # Output results to report.txt
    with open('report.txt', 'w') as out_file:
        for student_entry in students_data:
            out_file.write(student_entry + '\n')

        # Calculate and write class averages
        if student_count > 0:
            avg_m1 = m1_sum / student_count
            avg_m2 = m2_sum / student_count
            avg_final = final_sum / student_count

            out_file.write('\n')
            out_file.write(f"Averages: midterm1 {avg_m1:.2f}, midterm2 {avg_m2:.2f}, final {avg_final:.2f}\n")

    print("Report generated successfully in report.txt")

except FileNotFoundError:
    print(f"Error: The file '{file_name}' was not found.")
except Exception as e:
    print(f"An error occurred: {e}")