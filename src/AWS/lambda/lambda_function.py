import boto3
import json
import os
from json_processor import JSONProcessor

s3_client = boto3.client('s3')

def lambda_handler(event, context):
    print("[INFO] Running json_processor ...")

    s3_bucket_name = event['Records'][0]['s3']['bucket']['name']
    s3_file_name = event['Records'][0]['s3']['object']['key']
    if s3_bucket_name == 'example-bucket':
        s3_bucket_name = 'nci-cbiit-analysistools-fhhpedigree-dev'
        s3_file_name = 'raw/00101.json'

    print(f"Bucket: {s3_bucket_name}")
    print(f"Filename: {s3_file_name}")

    if s3_file_name.startswith('raw/'):
        print(f"[INFO] Processing file {s3_file_name}")

        #s3_client.download_file(s3_bucket_name, 'json', s3_file_name)
        response = s3_client.get_object(Bucket=s3_bucket_name, Key=s3_file_name)
        file_content = response['Body'].read().decode('utf-8')

        # Initialize processor
        processor = JSONProcessor()

        # Load input data
        input_data = processor.load_s3_json(file_content)
        if not isinstance(input_data, list):
            raise ValueError("Input JSON must be a list of records")

        # Process the records
        processor.process_records(input_data)
        print("[INFO] Processed records")

        # Generate and save output
        output_data = processor.get_output_data()
        #processor.save_json(output_data, output_path)

        # 2. Serialize to JSON string
        json_string = json.dumps(output_data)

        # 3. Upload to S3
        #s3_bucket_name = "your-s3-bucket-name"  # Replace with your S3 bucket name
        #s3_object_key = "path/to/your_data.json"  # Replace with your desired object key (file path in S3)
        #s3_object_key = 'processed/00101.processed.json'
        filename_with_ext = os.path.basename(s3_file_name)
        filename_without_ext = os.path.splitext(filename_with_ext)[0]
        s3_object_key = f"processed/{filename_without_ext}.processed.json"

        try:
            #s3 = boto3.client('s3')
            s3_client.put_object(
                Bucket=s3_bucket_name,
                Key=s3_object_key,
                Body=json_string,
                ContentType='application/json'  # Specify the content type for proper handling
            )
            print(f"JSON data successfully dumped to s3://{s3_bucket_name}/{s3_object_key}")
        except Exception as e:
            print(f"Error dumping JSON data to S3: {e}")

        # Print summary
        print(f"[INFO] Processing complete!")
        print(f"[INFO] Processed {len(input_data)} records")
        print(f"[INFO] Generated data for {len(processor.people)} people")
        print(f"[INFO] Proband: {processor.proband}")
    else:
        print(f"[INFO] Skipping file {s3_file_name}")

    # TODO implement
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }